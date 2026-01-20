# 📅 Week 3 — End-to-End Encryption (Core Feature)

## 🎯 Objective
Implement a **basic but correct End-to-End Encryption (E2EE)** system for the chat application such that:

- Messages are encrypted **on the client before sending**
- Messages are decrypted **only on the receiving client**
- The server **never has access to plaintext**
- Encryption works correctly for:
  - realtime messages
  - offline messages
  - page reloads
  - navigation between screens

This is **not WhatsApp-level E2EE**, but a **clean, interview-ready implementation** that demonstrates solid cryptography and system design fundamentals.

---

## 🔐 Cryptography Stack Used

| Purpose | Algorithm |
|------|---------|
| User identity | RSA-OAEP |
| Message encryption | AES-256-GCM |
| Key exchange | RSA (public key crypto) |
| Integrity | AES-GCM authentication |

---

## 🧠 High-Level Design

- Each user owns a **long-term RSA key pair**
  - Public key → stored on server
  - Private key → stays on client
- Each conversation uses a **single AES session key**
- The AES key is:
  - generated once
  - encrypted separately using **each user’s RSA public key**
  - stored on the server **only in encrypted form**
- Messages contain only:
  - ciphertext
  - IV
- **Encryption keys are never sent with messages**

---

## 🗓️ Day-wise Breakdown

---

### ✅ Day 1 — E2EE Architecture & Mental Model

- Understood why **hybrid encryption (RSA + AES)** is required
- Defined clear responsibilities:
  - RSA → key exchange
  - AES → message encryption
- Established the core rule:
  > If plaintext reaches the server, it is NOT end-to-end encrypted.

---

### ✅ Day 2 — RSA Key Pair Generation (Client-Side)

- Generated RSA key pairs using Web Crypto API
- Stored:
  - public key → server
  - private key → client only
- Learned why:
  - `CryptoKey` objects are non-serializable
  - `exportKey()` / `importKey()` are mandatory
- Ensured keys are generated **once per user**, not per login

---

### ✅ Day 3 — AES Encryption for Messages

- Implemented AES-256-GCM encryption
- Generated:
  - random IV per message
- Ensured:
  - encryption happens before sending
  - decryption happens after receiving
- Understood:
  - why IV must be unique
  - why IV is sent along with ciphertext

---

### ✅ Day 4 — AES Key Exchange (Major Challenges)

#### ❌ Problems Faced

1. **AES key sent with every message**
   - Broke E2EE design
   - Increased attack surface

2. **AES key regenerated multiple times**
   - Caused `OperationError` during decryption
   - Old messages became undecryptable

3. **Offline messages displayed encrypted text**
   - Receiver did not have AES key yet

---

#### ✅ Solution Implemented

- Separated **key exchange** from **message sending**
- Introduced a dedicated `/exchange` API
- AES key exchanged **once per conversation**
- Server stores **only RSA-encrypted AES keys**

---

### ✅ Day 5 — Directional Key Storage Bug (Critical Insight)

#### ❌ Problem

AES key was stored directionally as:


When the sender reopened the chat:
- reversed lookup failed
- app assumed no key existed
- new AES key was generated
- decryption failed for old messages

This caused:
- unnecessary updates
- key regeneration
- `OperationError`

---

#### ✅ Final Correct Solution

> **A conversation is symmetric, but encryption storage must be per-user.**

Implemented **two directional key records**:


This completely eliminated:
- reversed-query bugs
- accidental key regeneration
- decryption failures

---

### ✅ Day 6 — Navigation & State Loss Bug

#### ❌ Problem

- AES keys stored only in memory (`useRef`)
- Navigating away from chat page:
- cleared AES keys
- reopening chat regenerated new keys
- old messages failed to decrypt

---

#### ✅ Solution

- Implemented **AES key caching**
- Flow:
1. Check in-memory cache
2. Check localStorage cache
3. Fetch encrypted AES key from server
4. Decrypt using RSA private key
- Server remains **source of truth**
- localStorage acts as **temporary cache**, not authority

---

### ✅ Day 7 — Stabilization & Hardening

- Ensured:
- AES key generated **only once**
- RSA exchange happens **only once**
- Messages never carry keys
- Added:
- idempotent DB writes using `findOneAndUpdate`
- compound unique index on `(senderId, receiverId)`
- Verified:
- realtime messaging works
- offline messages decrypt correctly
- navigation does not break encryption

---

## 🔒 Final Message Flow

1. User opens chat
2. Client ensures AES key exists:
 - restore from cache
 - or fetch encrypted AES key
 - or generate & exchange once
3. Message send:
 - encrypt with AES
 - send ciphertext + IV
4. Message receive:
 - decrypt with AES
5. Server:
 - never sees plaintext
 - never sees raw AES keys

---

## 🧪 Issues Faced & Lessons Learned

| Issue | Lesson |
|----|----|
AES key in message payload | Keys must be exchanged, not transported |
Directional DB queries | Conversations are symmetric |
Key regeneration on reload | Crypto state must persist |
AES-GCM OperationError | Always caused by key mismatch |
Using memory only | Navigation destroys crypto state |

---

## 🗣️ Interview-Ready Summary

> I implemented a basic end-to-end encryption system using RSA for secure key exchange and AES-GCM for message encryption. Each conversation uses a single AES session key, which is encrypted separately for each user using their public RSA keys and stored encrypted on the server. Messages are encrypted on the client before sending and decrypted only on the receiving client, ensuring the server never has access to plaintext.

---

## ✅ Week 3 Status

- ✔ Real E2EE implemented
- ✔ RSA + AES hybrid encryption
- ✔ Offline & realtime support
- ✔ Navigation-safe
- ✔ Interview-defensible
- ✔ No crypto theater
