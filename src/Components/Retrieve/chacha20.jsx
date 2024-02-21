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

function bytesEqual(a, b) {
  var dif = 0;
  if (a.length !== b.length) return 0;
  for (var i = 0; i < a.length; i++) {
    dif |= (a[i] ^ b[i]);
  }
  dif = (dif - 1) >>> 31;
  return (dif & 1);
}

// testVectors from http://tools.ietf.org/html/draft-agl-tls-chacha20poly1305-04#page-11
var testVectors = [
  {
    key:       fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
    nonce:     fromHex('0000000000000000'),
    keystream: fromHex(
                '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc' + 
                '8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11c' + 
                'c387b669b2ee6586'
              ),
  },
  {
    key:       fromHex('0000000000000000000000000000000000000000000000000000000000000001'),
    nonce:     fromHex('0000000000000000'),
    keystream: fromHex(
                '4540f05a9f1fb296d7736e7b208e3c96eb4fe1834688d2604f450952' + 
                'ed432d41bbe2a0b6ea7566d2a5d1e7e20d42af2c53d792b1c43fea81' +
                '7e9ad275ae546963'
              ),
  },
  {
    key:       fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
    nonce:     fromHex('0000000000000001'),
    keystream: fromHex(
                'de9cba7bf3d69ef5e786dc63973f653a0b49e015adbff7134fcb7df1' +
                '37821031e85a050278a7084527214f73efc7fa5b5277062eb7a0433e' +
                '445f41e3'
              ),
  },
  {
    key:       fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
    nonce:     fromHex('0100000000000000'),
    keystream: fromHex(
                'ef3fdfd6c61578fbf5cf35bd3dd33b8009631634d21e42ac33960bd1' +
                '38e50d32111e4caf237ee53ca8ad6426194a88545ddc497a0b466e7d' +
                '6bbdb0041b2f586b'
              ),
  },
  {
    key:       fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
    nonce:     fromHex('0001020304050607'),
    keystream: fromHex(
                'f798a189f195e66982105ffb640bb7757f579da31602fc93ec01ac56' +
                'f85ac3c134a4547b733b46413042c9440049176905d3be59ea1c53f1' +
                '5916155c2be8241a38008b9a26bc35941e2444177c8ade6689de9526' +
                '4986d95889fb60e84629c9bd9a5acb1cc118be563eb9b3a4a472f82e' +
                '09a7e778492b562ef7130e88dfe031c79db9d4f7c7a899151b9a4750' +
                '32b63fc385245fe054e3dd5a97a5f576fe064025d3ce042c566ab2c5' +
                '07b138db853e3d6959660996546cc9c4a6eafdc777c040d70eaf46f7' +
                '6dad3979e5c5360c3317166a1c894c94a371876a94df7628fe4eaaf2' +
                'ccb27d5aaae0ad7ad0f9d4b6ad3b54098746d4524d38407a6deb3ab7' +
                '8fab78c9'
              ),
  },
];


function master() {
  
  var vect, ctx, klen, out;
  for (var i = 0; i < testVectors.length; i++) {
    vect = testVectors[i];
    klen = vect.keystream.length;
    out = new Array(klen);

    ctx = new Chacha20(vect.key, vect.nonce, 0);

    ctx.encrypt(out, out, klen);

    return (bytesEqual(vect.keystream, out));
  }
}

function enc(p, k, n){
  const pln = fromHex(textToHex(p));
  //console.log(textToHex(p));
  //console.log(pln);
  const l = pln.length;
  const ch = new Chacha20(k, n, 0);
  const ds = new Uint8Array(l);
  ch.encrypt(ds, pln, l);
  return ds;
}

function uint8ArrayToText(uint8Array) {
  let text = '';
  for (let i = 0; i < uint8Array.length; i++) {
    text += String.fromCharCode(uint8Array[i]);
  }
  return text;
}

export {enc, fromHex, uint8ArrayToText};