function U8TO32_LE(x, i) {
  return x[i] | (x[i+1]<<8) | (x[i+2]<<16) | (x[i+3]<<24);
}

function U32TO8_LE(x, i, u) {
  x[i]   = u; u >>>= 8;
  x[i+1] = u; u >>>= 8;
  x[i+2] = u; u >>>= 8;
  x[i+3] = u;
}

function ROTATE(v, c) {
  return (v << c) | (v >>> (32 - c));
}

class Chacha20 {
  constructor(key, nonce, counter) {
      this.input = new Uint32Array(16);

      this.input[0] = 1634760805;
      this.input[1] =  857760878;
      this.input[2] = 2036477234;
      this.input[3] = 1797285236;
      this.input[4] = U8TO32_LE(key, 0);
      this.input[5] = U8TO32_LE(key, 4);
      this.input[6] = U8TO32_LE(key, 8);
      this.input[7] = U8TO32_LE(key, 12);
      this.input[8] = U8TO32_LE(key, 16);
      this.input[9] = U8TO32_LE(key, 20);
      this.input[10] = U8TO32_LE(key, 24);
      this.input[11] = U8TO32_LE(key, 28);
      
      if (nonce.length === 12) {
          this.input[12] = counter;
          this.input[13] = U8TO32_LE(nonce, 0);
          this.input[14] = U8TO32_LE(nonce, 4);
          this.input[15] = U8TO32_LE(nonce, 8);
      } else {
          this.input[12] = counter;
          this.input[13] = 0;
          this.input[14] = U8TO32_LE(nonce, 0);
          this.input[15] = U8TO32_LE(nonce, 4);
      }
  }

  quarterRound(x, a, b, c, d) {
      x[a] += x[b]; x[d] = ROTATE(x[d] ^ x[a], 16);
      x[c] += x[d]; x[b] = ROTATE(x[b] ^ x[c], 12);
      x[a] += x[b]; x[d] = ROTATE(x[d] ^ x[a],  8);
      x[c] += x[d]; x[b] = ROTATE(x[b] ^ x[c],  7);
  }

  encrypt(dst, src, len) {
      var x = new Uint32Array(16);
      var output = new Uint8Array(64);
      var i, dpos = 0, spos = 0;

      while (len > 0 ) {
          for (i = 16; i--;) x[i] = this.input[i];
          for (i = 20; i > 0; i -= 2) {
              this.quarterRound(x, 0, 4, 8,12);
              this.quarterRound(x, 1, 5, 9,13);
              this.quarterRound(x, 2, 6,10,14);
              this.quarterRound(x, 3, 7,11,15);
              this.quarterRound(x, 0, 5,10,15);
              this.quarterRound(x, 1, 6,11,12);
              this.quarterRound(x, 2, 7, 8,13);
              this.quarterRound(x, 3, 4, 9,14);
          }
          for (i = 16; i--;) x[i] += this.input[i];
          for (i = 16; i--;) U32TO8_LE(output, 4*i, x[i]);

          this.input[12] += 1;
          if (!this.input[12]) {
              this.input[13] += 1;
          }
          if (len <= 64) {
              for (i = len; i--;) {
                  dst[i+dpos] = src[i+spos] ^ output[i];
              }
              return;
          }
          for (i = 64; i--;) {
              dst[i+dpos] = src[i+spos] ^ output[i];
          }
          len -= 64;
          spos += 64;
          dpos += 64;
      }
  }

}

function fromHex(h) {
  h.replace(' ', '');
  var out = [], len = h.length, w = '';
  for (var i = 0; i < len; i += 2) {
    w = h[i];
    if (((i+1) >= len) || typeof h[i+1] === 'undefined') {
        w += '0';
    } else {
        w += h[i+1];
    }
    out.push(parseInt(w, 16));
  }
  return out;
}

function textToHex(text) {
  let hex = '';
  for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i).toString(16).padStart(2, '0');
      hex += charCode;
  }
  return hex;
}



function uint8ArrayToHex(uint8Array) {
  return Array.prototype.map.call(uint8Array, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function hexToText(hexString) {
  let text = '';
  for (let i = 0; i < hexString.length; i += 2) {
      text += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
  }
  return text;
}

function enc(p, k, n){
  const pln = fromHex(textToHex(p));
  //console.log(textToHex(p));
  //console.log(pln);
  const l = pln.length;
  const ch = new Chacha20(k, n, 0);
  const ds = new Uint8Array(l);
  ch.encrypt(ds, pln, l);
  return hexToText(uint8ArrayToHex(ds));
}



export {enc, fromHex};