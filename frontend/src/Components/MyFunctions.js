const p = BigInt('115792089210356248762697446949407573530086143415290314195533631308867097853951');
const G = {
  x: BigInt('48439561293906451759052585252797914202762949526041747995844080717082404635286'),
  y: BigInt('36134250956749795798585127919587881956611106672985015071877198253568414405109'),
};

// Curve coefficient a (NIST P-256 curve parameter)
const a1 = BigInt(-3);

// Curve coefficient b (NIST P-256 curve parameter)
const b1 = BigInt('41058363725152142129326129780047268409114441015993725554835256314039467401291');

  // Function to generate a random private key
export function generateKeyPair() {
    const privateKey = getRandomPrivateKey();
    const publicKey = multiply(G, privateKey);
    console.log("Private Key:", privateKey);
    console.log("Public Key:", publicKey);
    return {privateKey, publicKey};
}

function getRandomPrivateKey() {
    // Generate a random number in the range [1, p-1]
    const n = p - BigInt(1);
    let privateKey;
    do {
        privateKey = BigInt(Math.floor(Math.random() * Number(n))) + BigInt(1);
    } while (!isValidPrivateKey(privateKey) || gcd(privateKey, p) !== 1n);
    return privateKey;
}


// Function to calculate the greatest common divisor (GCD)
function gcd(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}


// Check if a number is a valid private key (0 < key < p)
function isValidPrivateKey(key) {
    return key > BigInt(0) && key < p;
}

// ECC point multiplication (scalar multiplication)
export function multiply(point, scalar) {
    let result = null;
    let addend = { ...point };
    for (let bit of scalar.toString(2)) {
        if (bit === '1') {
            result = result ? add(result, addend) : { ...addend };
        }
        addend = double(addend); // Double the point for the next iteration
    }
    return result;
}

// ECC point addition
function add(point1, point2) {
    if (!point1.x && !point1.y) // If point1 is the point at infinity, return point2
        return point2;
    if (!point2.x && !point2.y) // If point2 is the point at infinity, return point1
        return point1;

    // Calculate slope
    let slope;
    if (point1.x !== point2.x || point1.y !== point2.y) {
        slope = ((point1.y - point2.y) * modInverse(point1.x - point2.x, p)) % p;
    } else {
        slope = ((3n * point1.x * point1.x + a1) * modInverse(2n * point1.y, p)) % p;
    }

    // Calculate new point coordinates
    const x3 = (slope * slope - point1.x - point2.x) % p;
    const y3 = (slope * (point1.x - x3) - point1.y) % p;

    return { x: x3 < 0 ? x3 + p : x3, y: y3 < 0 ? y3 + p : y3 }; // Ensure positive coordinates
}

// ECC point doubling
function double(point) {
    // If point is the point at infinity, return itself
    if (!point.x && !point.y) return point;

    // Calculate slope
    const slope = ((3n * point.x * point.x + a1) * modInverse(2n * point.y, p)) % p;

    // Calculate new point coordinates
    const x3 = (slope * slope - 2n * point.x) % p;
    const y3 = (slope * (point.x - x3) - point.y) % p;

    return { x: x3 < 0 ? x3 + p : x3, y: y3 < 0 ? y3 + p : y3 }; // Ensure positive coordinates
}

// ECC modular inverse function
function modInverse(a, p) {
    return BigInt(modPow(a, p - 2n, p));
}

function modPow(base, exponent, modulus) {
    base = BigInt(base);
    exponent = BigInt(exponent);
    modulus = BigInt(modulus);
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) result = (result * base) % modulus;
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}