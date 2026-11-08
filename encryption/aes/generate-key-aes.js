const crypto = require("crypto");

const key = crypto.randomBytes(32); // secret key
const iv = crypto.randomBytes(16); // initialization vector
console.log("Key:", key.toString("hex"));
console.log("IV:", iv.toString("hex"));

/**
 * Anyone can run this code to generate random KEY and IV.
 * IV stands for Initialization Vector, it is used to add
 * randomness to the ciphertext.
 */