const crypto = require('crypto');

const options = {
  modulusLength: 2048, // default is 2048 bits
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  }
};

const { privateKey: senderPrivateKey, publicKey: senderPublicKey } = crypto.generateKeyPairSync("rsa", options);
console.log("Private Key:", senderPrivateKey);
console.log("Public Key:", senderPublicKey);

/**
 * Anyone can run this code to generate random PRIVATE KEY
 * and PUBlIC KEY. No need to worry about duplication since
 * the chance for two different persons to generate the same
 * PRIVATE KEY and PUBLIC KEY pair is very very very low.
 */