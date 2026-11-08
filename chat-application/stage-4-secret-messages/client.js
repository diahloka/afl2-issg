
const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let registeredUsername = "";
let username = "";
let targetUsername = "";

const users = new Map();

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// Export public key
const publicKeyString = publicKey.export({
  type: "spki",
  format: "pem",
});

// Create digital signature
function signMessage(data) {
  return crypto.sign(
    "sha256",
    Buffer.from(JSON.stringify(data)),
    privateKey
  ).toString("base64");
}

// Verify digital signature
function verifyMessage(data, signature, senderPublicKey) {
  try {
    return crypto.verify(
      "sha256",
      Buffer.from(JSON.stringify(data)),
      senderPublicKey,
      Buffer.from(signature, "base64")
    );
  } catch (error) {
    return false;
  }
}

// Encrypt message using recipient's public key
function encryptMessage(message, recipientPublicKey) {
  return crypto.publicEncrypt(
    {
      key: recipientPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(message)
  ).toString("base64");
}

// Decrypt message using own private key
function decryptMessage(encryptedMessage) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedMessage, "base64")
  ).toString();
}

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input.trim();
    registeredUsername = username;

    console.log(`Welcome, ${username} to the chat`);

    // Store own public key
    users.set(username, publicKeyString);

    // Register public key with server
    socket.emit("registerPublicKey", {
      username,
      publicKey: publicKeyString,
    });

    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        let match;

        // Start secret chat
        if ((match = message.match(/^!secret (\w+)$/))) {
          const requestedTarget = match[1];

          if (!users.has(requestedTarget)) {
            console.log(`User ${requestedTarget} not found`);
          } else if (requestedTarget === registeredUsername) {
            console.log("You cannot start a secret chat with yourself");
          } else {
            targetUsername = requestedTarget;
            console.log(
              `Now secretly chatting with ${targetUsername}`
            );
          }

        // Exit secret chat
        } else if (message.match(/^!exit$/)) {
          if (targetUsername) {
            console.log(
              `No more secretly chatting with ${targetUsername}`
            );
            targetUsername = "";
          } else {
            console.log("You are not in a secret chat");
          }

        // Send message
        } else {
          try {
            let payload;
            let signedData;

            if (targetUsername) {
              const recipientPublicKey = users.get(targetUsername);

              // Encrypt using recipient's public key
              const ciphertext = encryptMessage(
                message,
                recipientPublicKey
              );

              signedData = {
                username: registeredUsername,
                type: "secret",
                targetUsername,
                content: ciphertext,
              };

              payload = {
                type: "secret",
                targetUsername,
                content: ciphertext,
                signature: signMessage(signedData),
              };

            } else {
              signedData = {
                username: registeredUsername,
                type: "normal",
                targetUsername: "",
                content: message,
              };

              payload = {
                type: "normal",
                content: message,
                signature: signMessage(signedData),
              };
            }

            socket.emit("message", {
              username: registeredUsername,
              message: JSON.stringify(payload),
            });

          } catch (error) {
            console.log(
              "Unable to send message:",
              error.message
            );
          }
        }
      }

      rl.prompt();
    });
  });
});

// Receive existing users
socket.on("init", (keys) => {
  keys.forEach(([user, key]) => {
    users.set(user, key);
  });

  console.log(
    `\nThere are currently ${users.size} users in the chat`
  );

  rl.prompt();
});

// Receive new user notification
socket.on("newUser", (data) => {
  const {
    username: newUsername,
    publicKey: newPublicKey,
  } = data;

  users.set(newUsername, newPublicKey);

  if (newUsername !== registeredUsername) {
    console.log(`${newUsername} joined the chat`);
    rl.prompt();
  }
});

// Receive and process messages
socket.on("message", (data) => {
  const {
    username: senderUsername,
    message: senderMessage,
  } = data;

  if (senderUsername !== registeredUsername) {
    try {
      const payload = JSON.parse(senderMessage);

      const senderPublicKey = users.get(senderUsername);

      let signedData;

      if (payload.type === "secret") {
        signedData = {
          username: senderUsername,
          type: "secret",
          targetUsername: payload.targetUsername,
          content: payload.content,
        };
      } else {
        signedData = {
          username: senderUsername,
          type: "normal",
          targetUsername: "",
          content: payload.content,
        };
      }

      // Verify sender's digital signature
      if (
        !senderPublicKey ||
        !verifyMessage(
          signedData,
          payload.signature,
          senderPublicKey
        )
      ) {
        console.log("WARNING: this user is fake");

      } else if (payload.type === "secret") {

        // Only the target decrypts the message
        if (payload.targetUsername === registeredUsername) {
          const plaintext = decryptMessage(payload.content);

          console.log(
            `${senderUsername}: ${plaintext}`
          );

        } else {
          // Other users only see ciphertext
          console.log(
            `${senderUsername}: ${payload.content}`
          );
        }

      } else {
        console.log(
          `${senderUsername}: ${payload.content}`
        );
      }

    } catch (error) {
      console.log("WARNING: this user is fake");
    }

    rl.prompt();
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting...");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});
