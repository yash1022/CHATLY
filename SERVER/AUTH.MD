# MERN Auth — JWT Access Tokens + Rotating Refresh Tokens

This repository demonstrates a secure **JWT access token + rotating refresh token** authentication system using the MERN stack (MongoDB, Express, React, Node).

**Key features**
- Short-lived JWT access tokens (stateless) for fast API authorization.
- Long-lived opaque refresh tokens used as sessions, stored as httpOnly cookies.
- **Refresh token rotation** (one-time use): every refresh issues a new refresh token and revokes the old one.
- **Reuse detection**: if a revoked refresh token is used, server revokes all sessions for that user (security).
- Server stores refresh tokens **hashed** in DB (protects DB leaks).
- Per-device/session management via one session record per refresh token.

---

## Why this design?

- Access tokens are short-lived and reduce impact if leaked.
- Refresh tokens are stateful (server can revoke/rotate) so you can force logout, detect theft, and manage sessions.
- Rotation makes refresh tokens effectively one-time use — improves security massively.
- Storing refresh tokens in `httpOnly` cookies prevents JS access (mitigates XSS).

---

## How it works — summary

1. **Login**
   - Server validates credentials.
   - Issues short-lived access token (JWT).
   - Generates opaque refresh token `tokenId.secret`, stores **hash** of whole token in Sessions collection (with `_id = tokenId`) and sets cookie with raw token.

2. **Use API**
   - Client attaches `Authorization: Bearer <accessToken>` to requests.
   - Server verifies JWT signature & expiry.

3. **Refresh**
   - When access token expires, client calls `/auth/refresh`.
   - Browser sends cookie automatically.
   - Server finds session by `tokenId`, `bcrypt.compare` the cookie raw value to stored hash, and if valid:
     - Revokes old session, creates a new session+refresh token.
     - Returns a new access token and sets new refresh cookie.
   - If old token is reused after being revoked → server detects reuse and revokes all sessions for that user.

4. **Logout**
   - `POST /auth/logout` revokes the session referenced by cookie and clears cookie.

---

## How to run (locally)

### Prereqs
- Node.js (16+), npm
- MongoDB running locally or accessible via URI

### Server
```bash
cd server
cp .env.example .env
# edit .env to set MONGO_URI and JWT_SECRET
npm install
npm run dev
