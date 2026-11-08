# AFL-2 – Information Systems Security & Governance

**Putu Diahloka Mahaputri**  
Student ID: 0706022410008

**Universitas Ciputra Surabaya**  
**Academic Year 2026/2027**

This repository contains practical assignments and exercises for the Information Systems Security & Governance course. The assignments explore fundamental cryptographic concepts and their implementation using JavaScript and Node.js.

## Repository Structure

```text
afl2-issg/
│
├── chat-application/
│   ├── stage-1-making-chat/
│   ├── stage-2-malicious-chat/
│   ├── stage-3-impersonating-user/
│   └── stage-4-secret-messages/
│
├── digital-signature/
│   ├── ecdsa/
│   └── rsa/
│
├── encryption/
│   ├── aes/
│   └── rsa/
│
├── hash/
│   ├── generate-hash.js
│   └── verify-hash.js
│
└── secure-channel/
    └── secure-channel.js
```

## Assignment Modules

### 1. Hash

Explores cryptographic hash functions and their applications in message integrity verification.

**Implementation:**
- `generate-hash.js` – Generates MD5, SHA-1, and SHA-256 hash values from a given message.
- `verify-hash.js` – Verifies message integrity by comparing the generated hash with the original hash.

**Key Concepts:**
- Deterministic hash functions
- Avalanche effect
- Hash verification
- Message integrity

### 2. Digital Signature

Explores digital signatures using RSA and ECDSA algorithms to verify message authenticity and integrity.

**RSA Implementation:**
- `generate-key-rsa.js` – Generates RSA public and private key pairs.
- `sign-rsa.js` – Creates a digital signature using the private key.
- `verify-rsa.js` – Verifies a digital signature using the public key.

**ECDSA Implementation:**
- `generate-key-ecdsa.js` – Generates ECDSA public and private key pairs.
- `sign-ecdsa.js` – Creates a digital signature using the private key.
- `verify-ecdsa.js` – Verifies a digital signature using the public key.

**Key Concepts:**
- Public and private key pairs
- Digital signature generation
- Signature verification
- Message integrity and authenticity
- Differences between RSA and ECDSA

### 3. Encryption

Explores symmetric and asymmetric encryption techniques through AES and RSA algorithms.

**AES Implementation:**
- `generate-key-aes.js` – Generates a secret key and Initialization Vector (IV).
- `encrypt-aes.js` – Encrypts plaintext using AES-256-CBC.
- `decrypt-aes.js` – Decrypts ciphertext using the corresponding key and IV.

**RSA Implementation:**
- `encrypt-rsa.js` – Encrypts plaintext using the recipient's public key.
- `decrypt-rsa.js` – Decrypts ciphertext using the recipient's private key.

**Key Concepts:**
- Symmetric encryption
- Asymmetric encryption
- AES-256-CBC
- RSA-OAEP
- Encryption and decryption
- Key and IV management

### 4. Secure Channel

Implements a secure communication channel between a sender and recipient by combining RSA and AES cryptography.

**Implementation:**
- `secure-channel.js` – Demonstrates the establishment of a secure channel, including key exchange, digital signatures, and encrypted communication.

**Key Concepts:**
- RSA public and private key pairs
- Secure exchange of key materials
- Secret key and IV splitting and merging
- AES session key
- Secure message encryption and decryption
- Combination of asymmetric and symmetric cryptography

### 5. Chat Application Challenge

Develops a multi-stage real-time chat application while exploring different security threats and cryptographic protection mechanisms.

| Stage | Description |
|---|---|
| Stage 1 – Making the Chat | Builds a basic real-time chat application using Socket.IO. |
| Stage 2 – Malicious Chat Server | Demonstrates message modification by a malicious server and detects changes using hashing. |
| Stage 3 – Impersonating Other Users | Uses RSA digital signatures to verify sender authenticity and detect impersonation attempts. |
| Stage 4 – Sending Secret Messages | Implements RSA encryption to enable private communication between selected users. |

**Key Concepts:**
- Client-server communication
- Message integrity
- Hash-based verification
- RSA digital signatures
- User authentication and impersonation detection
- Public-key encryption
- Confidential communication

## Technologies Used

- JavaScript
- Node.js
- Node.js Crypto Module
- Socket.IO
- Git and GitHub

## How to Run

### Cryptography Exercises

The Hash, Digital Signature, Encryption, and Secure Channel exercises use Node.js built-in modules.

1. Open a terminal in the corresponding assignment folder.
2. Run the JavaScript file using Node.js.

Example:

```bash
node generate-hash.js
```

Other scripts can be executed in the same way by replacing the filename.

### Chat Application

Each stage is organized independently and has its own dependencies.

1. Navigate to the desired stage folder.

```bash
cd chat-application/stage-1-making-chat
```

2. Initialize the Node.js project.

```bash
npm init -y
```

3. Install the required Socket.IO dependencies.

```bash
npm install socket.io socket.io-client
```

4. Start the server.

```bash
node server.js
```

5. Open another terminal in the same stage folder and run the client.

```bash
node client.js
```

6. Open additional terminals to connect multiple chat clients.

**Note:** For Stage 2, `malicious-server.js` can be executed instead of `server.js` to demonstrate the behavior of a malicious chat server.

## Author

**Putu Diahloka Mahaputri**  
Student ID: 0706022410008

Information Systems for Business  
Universitas Ciputra Surabaya
