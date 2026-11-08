const crypto = require("crypto");

const options = {
  namedCurve: "secp256k1", // name of the curve
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
};

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", options);
console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);

/**
 * Anyone can run this code to generate random PRIVATE KEY
 * and PUBlIC KEY. No need to worry about duplication since
 * the chance for two different persons to generate the same
 * PRIVATE KEY and PUBLIC KEY pair is very very very low.
 */