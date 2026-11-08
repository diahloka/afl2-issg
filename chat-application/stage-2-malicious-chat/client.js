
const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";

// Generate SHA-256 hash
function generateHash(message) {
  return crypto
    .createHash("sha256")
    .update(message)
    .digest("hex");
}

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome, ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        const hash = generateHash(message);

        const payload = JSON.stringify({
          message,
          hash,
        });

        socket.emit("message", {
          username,
          message: payload,
        });
      }

      rl.prompt();
    });
  });
});

socket.on("message", (data) => {
  const {
    username: senderUsername,
    message: senderMessage,
  } = data;

  if (senderUsername !== username) {
    try {
      const payload = JSON.parse(senderMessage);
      const receivedHash = generateHash(payload.message);

      if (receivedHash !== payload.hash) {
        console.log(
          "WARNING: the message may have been changed during transmission"
        );
      } else {
        console.log(`${senderUsername}: ${payload.message}`);
      }
    } catch (error) {
      console.log(
        "WARNING: the message may have been changed during transmission"
      );
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
