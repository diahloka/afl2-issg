
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

        if ((match = message.match(/^!impersonate (\w+)$/))) {
          username = match[1];
          console.log(`Now impersonating as ${username}`);

        } else if (message.match(/^!exit$/)) {
          username = registeredUsername;
          console.log(`Now you are ${username}`);

        } else {
          const signedData = {
            username,
            message,
          };

          const signature = signMessage(signedData);

          const payload = JSON.stringify({
            message,
            signature,
          });

          socket.emit("message", {
            username,
            message: payload,
          });
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

// Receive and verify messages
socket.on("message", (data) => {
  const {
    username: senderUsername,
    message: senderMessage,
  } = data;

  if (senderUsername !== username) {
    try {
      const payload = JSON.parse(senderMessage);

      const signedData = {
        username: senderUsername,
        message: payload.message,
      };

      const senderPublicKey = users.get(senderUsername);

      // Verify digital signature
      if (
        !senderPublicKey ||
        !verifyMessage(
          signedData,
          payload.signature,
          senderPublicKey
        )
      ) {
        console.log("WARNING: this user is fake");
      } else {
        console.log(`${senderUsername}: ${payload.message}`);
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
