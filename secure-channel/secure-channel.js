const crypto = require('crypto');

function mergeBytes(firstByte, secondByte) {
  const totalBytes = firstByte.length + secondByte.length;
  return Buffer.concat([firstByte, secondByte], totalBytes);
}

function mergeKeyAndIV(key, iv) {
  const mergedBuff = mergeBytes(key, iv);
  return "0x" + mergedBuff.toString("hex");
}

function splitKeyAndIV(combined) {
  const parts = combined.split("0x");
  const mergedBuff = Buffer.from(parts[1], "hex");
  const splitKey = mergedBuff.subarray(0, 16);
  const splitIV = mergedBuff.subarray(-8);
  return { splitKey, splitIV };
}

// both parties agree on security parameters
const algorithm = "aes-256-cbc";
const options = {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
};

// recipient creates private and public key
const { privateKey: recipientPrivateKey, publicKey: recipientPublicKey } = crypto.generateKeyPairSync("rsa", options);
console.log("> Recipient sends PUBLIC KEY to sender");

// sender generates private and public key
const { privateKey: senderPrivateKey, publicKey: senderPublicKey } = crypto.generateKeyPairSync("rsa", options);
console.log("> Sender sends PUBLIC KEY to recipient");

// sender generates first half of secret key and iv
const senderSecretKey = crypto.randomBytes(16);
const senderIV = crypto.randomBytes(8);

// sender prepares payload to be signed and encrypted
let payload = mergeKeyAndIV(senderSecretKey, senderIV);
let data = Buffer.from(payload);

// sender signs and encrypts the payload
let signature = crypto.sign("sha256", data, senderPrivateKey);
let ciphertext = crypto.publicEncrypt(recipientPublicKey, data);

console.log("> Sender sends SIGNATURE and CIPHERTEXT to recipient");

// recipient decrypts and verifies the payload
let recoveredPlaintext = crypto.privateDecrypt(recipientPrivateKey, ciphertext).toString("utf8");
let isVerified = crypto.verify("sha256", recoveredPlaintext, senderPublicKey, signature);
if (!isVerified) throw new Error("invalid signature");

const { splitKey: secretKeyFromSender, splitIV: ivFromSender } = splitKeyAndIV(recoveredPlaintext);

// recipient generates second half of secret key and iv
const recipientSecretKey = crypto.randomBytes(16);
const recipientIV = crypto.randomBytes(8);

// recipient prepares payload to be signed and encrypted
payload = mergeKeyAndIV(recipientSecretKey, recipientIV);
data = Buffer.from(payload);

// recipient signs and encrypts the payload
signature = crypto.sign("sha256", data, recipientPrivateKey);
ciphertext = crypto.publicEncrypt(senderPublicKey, data);

console.log("> Recipient sends SIGNATURE and CIPHERTEXT to sender");

// sender decrypts the payload and verifies it
recoveredPlaintext = crypto.privateDecrypt(senderPrivateKey, ciphertext).toString("utf8");
isVerified = crypto.verify("sha256", data, recipientPublicKey, signature);
if (!isVerified) throw new Error("invalid signature");

const { splitKey: secretKeyFromRecipient, splitIV: ivFromRecipient } = splitKeyAndIV(recoveredPlaintext);

console.log("> All parts (first and second half) of SECRET KEY and IV have been obtained by both sender and recipient");

// sender builds the session key and iv
const senderSessionKey = mergeBytes(senderSecretKey, secretKeyFromRecipient);
const senderSessionIV = mergeBytes(senderIV, ivFromRecipient);

// sender encrypts the message
const message = "this is a secret message";
const cipher = crypto.createCipheriv(algorithm, senderSessionKey, senderSessionIV);
let c = cipher.update(message, "utf8", "hex");
c += cipher.final("hex");

console.log("> Sender sends CIPHERTEXT to recipient in SECURE CHANNEL");

// recipient builds the session key and iv
const recipientSessionKey = mergeBytes(secretKeyFromSender, recipientSecretKey);
const recipientSessionIV = mergeBytes(ivFromSender, recipientIV);

// assertions, sender and recipient should have the same session key
if (Buffer.compare(senderSessionKey, recipientSessionKey)) throw new Error("invalid session key");
if (Buffer.compare(senderSessionIV, recipientSessionIV)) throw new Error("invalid session IV");

// recipient decrypts the received message
const decipher = crypto.createDecipheriv(algorithm, recipientSessionKey, recipientSessionIV);
let d = decipher.update(c, "hex", "utf8");
d += decipher.final("utf8");
console.log("> Recipient receive message:", d);