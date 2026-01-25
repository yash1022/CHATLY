# 🔐 Secure Real-Time Chat Application with End-to-End Encryption (E2EE)

A full-stack **real-time chat application** built with modern web technologies, focusing heavily on **security, privacy, and scalability**. This project implements **true end-to-end encryption**, ensuring that only the sender and receiver can read messages — not even the server.

This project is designed to be **resume-ready**, **deployment-ready**, and aligned with real-world messaging system architectures.

---

## 🚀 Key Features

* 🔒 **End-to-End Encryption (E2EE)**

  * RSA public/private key pair per user
  * AES symmetric encryption for message payloads
  * Secure encrypted key exchange

* 💬 **Real-Time Messaging**

  * WebSocket-based communication (Socket.IO)
  * Instant message delivery
  * Typing indicators & online status (optional)

* 👤 **User Management**

  * Authentication using JWT (Access + Refresh Tokens)
  * Secure login & registration
  * Search users by **username or email** and start DMs

* 📦 **Media & Message Security**

  * Encrypt messages *before sending*
  * Decrypt messages *only on the client*
  * Server never sees plaintext messages

* 🌐 **Production Deployment**

  * Backend deployed on Render
  * Database hosted on MongoDB Atlas
  * Fully HTTPS-secured environment

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript (ES6+)
* Socket.IO Client
* Crypto APIs (Web Crypto)

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* Crypto (RSA + AES)

### Database

* MongoDB
* Mongoose ODM

### DevOps / Deployment

* Render (Backend Hosting)
* MongoDB Atlas (Cloud Database)
* Environment-based configuration

---

## 🔐 Encryption Architecture (High-Level)

1. Each user generates an **RSA key pair** on registration
2. Public key is stored on the server
3. Private key never leaves the client
4. For each chat:

   * AES session key is generated
   * AES key is encrypted using recipient’s RSA public key
5. Messages are encrypted with AES before sending
6. Receiver decrypts AES key → decrypts message

**Result:** Server handles only encrypted blobs.

---

## 📂 Project Structure

```
chat-application/
│
├── client/                # React frontend
│   ├── src/
│   └── public/
│
├── server/                # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── sockets/
│   ├── middleware/
│   └── utils/crypto/
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=https://your-frontend-url
```

---

## ▶️ Running the Project Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/secure-chat-app.git
cd secure-chat-app
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🧪 Testing Checklist

* ✅ User registration & login
* ✅ Public/Private key generation
* ✅ Encrypted message sending
* ✅ Correct message decryption
* ✅ Real-time delivery
* ✅ Token refresh handling

---

## 🧠 Learning Outcomes

* Deep understanding of **cryptography in real systems**
* Practical use of **RSA + AES hybrid encryption**
* WebSocket-based real-time architecture
* Secure authentication flows
* Deployment & environment debugging

---

## 📌 Future Improvements

* Group chats with encrypted key distribution
* Message integrity checks (HMAC)
* Forward secrecy (Diffie-Hellman)
* Encrypted media/file sharing
* Mobile-first UI

---

## 🏁 Conclusion

This project demonstrates how **secure messaging systems** work under the hood — similar to WhatsApp or Signal — but built from scratch with clarity and control. It prioritizes **security-first design**, making it an excellent showcase project for internships, placements, and system-design discussions.

---


