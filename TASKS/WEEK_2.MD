# Day 1 — Socket.IO Authentication Setup

## Objective

Set up a secure, authenticated Socket.IO connection that integrates cleanly with the existing JWT-based authentication system. The goal was to ensure that **only authenticated users can establish real-time connections**, and that socket lifecycle is correctly tied to auth state.

---

## High-Level Architecture

* **Express** handles REST APIs (auth, users, messages)
* **Socket.IO** handles real-time communication
* Both run on the **same HTTP server and port**
* **JWT access token** is used to authenticate socket connections
* **Refresh token remains in httpOnly cookie** (used only for HTTP refresh flow)

Key principle:

> HTTP handles state, Socket.IO handles events, JWT decides identity.

---

## Authentication Strategy

### Access Token Handling

* Access token is **NOT stored in cookies**
* Stored in memory on the client
* Sent explicitly during Socket.IO handshake using `handshake.auth`

### Why This Matters

* Socket.IO does not automatically send `Authorization` headers
* Explicit token passing avoids ambiguity and improves security
* Refresh tokens are intentionally **not** used for socket authentication

---

## Server-Side Setup

### Socket.IO Integration

* Socket.IO is attached to the same HTTP server as Express
* No separate socket server or port

### Socket Authentication Middleware

* Runs **before** socket connection is established
* Responsibilities:

  * Extract access token from `socket.handshake.auth`
  * Verify JWT
  * Attach `userId` to `socket`
  * Reject unauthorized connections

Once authenticated:

* `socket.userId` becomes the **single source of truth**
* Client-sent `userId` values are never trusted

---

## Client-Side Setup

### Centralized Socket Instance

* A single socket instance is maintained (singleton pattern)
* Prevents duplicate connections and memory leaks

### Connection Logic

* Socket connects **only when access token exists**
* Socket reconnects if access token changes (token rotation)
* Socket disconnects cleanly on logout or app unmount

### Token Rotation Handling

* When access token changes:

  * Update `socket.auth.token`
  * Force a clean disconnect and reconnect

---

## React Lifecycle Management

### Auth-Driven Effect

* Watches `accessToken`
* Connects socket on login
* Disconnects socket on logout

### Cleanup Effect

* Disconnects socket on component unmount
* Prevents zombie connections and incorrect online state

Both effects are required to cover all scenarios:

* Login / Logout
* Token refresh
* Page refresh / tab close

---

## What Was Explicitly NOT Implemented Today

* Messaging logic
* Online users tracking
* Rooms or namespaces
* Typing indicators
* Message persistence
* Encryption

Day 1 focused strictly on **secure plumbing**, not features.

---

## Validation Checklist

* [x] Unauthorized socket connections are rejected
* [x] Authorized users connect successfully
* [x] `socket.userId` is available server-side
* [x] Multiple tabs create multiple sockets
* [x] Refresh creates a new socket ID
* [x] Sockets disconnect cleanly on logout and unmount

---

## Outcome

A production-ready, secure Socket.IO foundation that is stable, debuggable, and ready for Day 2 features such as online user tracking and real-time messaging.

---

## Next Steps

**Day 2 — Online Users Tracking**

* Maintain user-to-socket mappings
* Handle multi-tab scenarios
* Emit real-time online/offline events






# Day 2 — Online Users Tracking

## Objective

Implement **accurate, real-time online/offline user tracking** using Socket.IO, handling multi-tab usage, refreshes, and disconnects correctly.

The goal of Day 2 was to ensure that **online status reflects the user, not individual sockets**.

---

## Core Principle

> **Sockets connect and disconnect. Users go online and offline.**

A user can have multiple active sockets (multiple tabs or refreshes), but should appear **online only once** and **offline only when all sockets disconnect**.

---

## High-Level Design

### Data Model (In-Memory)

```text
userId → Set(socketIds)
```

* Each user maps to a set of active socket connections
* Online status is determined by whether the set exists and is non-empty
* Data is stored **in memory only** (not persisted)

Why in-memory?

* Online status is ephemeral
* Should not survive server restarts
* Database storage would be incorrect and inefficient

---

## Server-Side Responsibilities

### 1. Track Active Sockets Per User

* On socket connection:

  * Add `socket.id` to the user’s set
  * Detect if the user was previously offline

* On socket disconnection:

  * Remove `socket.id` from the user’s set
  * If no sockets remain, mark user offline

### 2. Emit Events

Events emitted by the server:

* `user_online` → emitted **once per user**, when first socket connects
* `user_offline` → emitted when last socket disconnects
* `online_users` → snapshot of currently online users (sent on connect)

Rules:

* No socket IDs are ever sent to clients
* Clients never emit online/offline events

---

## Client-Side Responsibilities

### State Management

* Maintain a list of online user IDs
* React only to server-emitted events
* Never infer online status from socket connection state

### Why React Context Was Used

Online users state is:

* Global (needed in multiple components)
* Reactive (UI must update instantly)
* Updated by socket events

React Context provides:

* Centralized state
* No prop drilling
* Clean separation between socket logic and UI

---

## Multi-Tab & Refresh Handling

Correct behavior implemented:

* Opening multiple tabs → user appears online once
* Closing one tab → user remains online
* Closing last tab → user goes offline
* Refreshing page → stable online state
* Logging out → user goes offline

This is achieved by tracking **sets of socket IDs per user**.

---

## Failure Scenarios Considered

* Browser refresh
* Multiple tabs
* Network disconnects
* Logout
* Token re-authentication

(Server restarts reset online state by design)

---

## What Was Explicitly NOT Implemented

* Messaging logic
* Read receipts
* Typing indicators
* Rooms or namespaces
* Database persistence

Day 2 focused strictly on **presence tracking correctness**.

---

## Validation Checklist

* [x] User comes online only once (first socket)
* [x] No duplicate online events for multiple tabs
* [x] User remains online until last socket disconnects
* [x] Offline event emitted exactly once
* [x] Refresh does not cause false offline
* [x] No socket IDs exposed to client

---

## Outcome

A robust, production-grade online presence system that accurately reflects user availability and is safe to build messaging, typing indicators, and read receipts on top of.

---

## Next Step

**Day 3 — Plaintext Messaging**

* 1-to-1 real-time message flow
* Message persistence
* Delivery guarantees



# Day 3 — Plaintext Messaging (1-to-1)

## Objective

Implement a **real-time, persistent, one-to-one messaging system** using Socket.IO and a database, ensuring correctness, security, and multi-device support.

By the end of Day 3, the chat application supports:

* Instant message delivery
* Message persistence
* Multi-tab and multi-device correctness
* Clear separation between real-time delivery and data storage

---

## Core Principle

> **Sockets deliver messages. The database stores truth.**

Socket.IO is used for low-latency delivery, but the database is always the source of truth. A message is considered valid only after it is persisted.

---

## Message Lifecycle (Authoritative Flow)

1. Client emits `send_message`
2. Server authenticates sender via `socket.userId`
3. Server validates payload
4. Message is **saved to the database first**
5. Message is emitted:

   * Back to the sender (echo / ack)
   * To all active receiver sockets (if online)
6. Clients update UI from socket events
7. On refresh or offline state, messages are fetched from DB

This order is non-negotiable.

---

## Database Schema

Each message is stored as a **single document**.

### Fields

* `sender` — User ID of sender (from socket auth)
* `receiver` — User ID of receiver
* `content` — Plaintext message body
* `createdAt` — Timestamp for ordering
* `updatedAt` — Reserved for future edits

### Design Choices

* One document per message (simple, scalable)
* No chat/conversation table yet
* No read receipts or delivery status yet
* Schema is intentionally minimal and extensible

---

## Socket Events

### Client → Server

**Event:** `send_message`

Payload:

```json
{
  "receiverId": "<user_id>",
  "content": "Hello"
}
```

Notes:

* `senderId` is never accepted from the client
* Sender identity is derived from the authenticated socket

---

### Server → Client

**Event:** `new_message`

Payload:

```json
{
  "message": { /* message document */ }
}
```

The same event is used for both sender and receiver.

---

## Server-Side Responsibilities

* Validate incoming message payloads
* Derive sender identity from socket authentication
* Persist messages before emitting
* Deliver messages to all active receiver sockets
* Echo messages back to sender
* Never trust client-sent identity data

---

## Client-Side Responsibilities

* Emit messages via socket
* Listen for `new_message` events
* Update UI in real time
* Fetch message history via HTTP on chat open
* Never infer message delivery status on its own

---

## Multi-Tab & Multi-Device Handling

* Messages are delivered to **all active sockets** of a user
* Sender receives exactly one echo per message
* Offline receivers rely on DB fetch when they reconnect
* No socket IDs are exposed to the client

---

## Network & Environment Considerations

To support multiple devices (e.g. phone + laptop):

* Avoid hard-coded `localhost` in socket URLs
* Either:

  * Proxy Socket.IO via the frontend dev server, or
  * Use environment-based backend URLs

HTTP requests work through frontend proxy, but Socket.IO connects directly to the backend and must use a reachable host.

---

## What Was Explicitly NOT Implemented

* Read receipts
* Typing indicators
* Encryption
* Message editing/deleting
* Group chats

These features are intentionally deferred to later days.

---

## Validation Checklist

* [x] Sender sees message instantly
* [x] Receiver sees message instantly when online
* [x] Messages persist after refresh
* [x] Offline receiver gets messages via fetch
* [x] No sender identity accepted from client
* [x] Multi-tab delivery works correctly
* [x] Multi-device connections work correctly

---

## Outcome

A **production-grade plaintext messaging foundation** that is secure, debuggable, and ready for enhancements such as read receipts, typing indicators, and encryption.

---

## Next Step

**Day 4 — Read Receipts & Typing Indicators**



# Day 4 — Read Receipts & Typing Indicators

## Objective

Add **accurate read receipts** and **smooth typing indicators** to the chat system without introducing false positives, socket spam, or multi-tab inconsistencies.

Day 4 focuses on distinguishing **persistent truth** (read state) from **ephemeral signals** (typing), and implementing each with the correct guarantees.

---

## Core Principles

> **Read receipts are persistent truth.**
> **Typing indicators are temporary hints.**

* Read receipts must be stored in the database
* Typing indicators must never be stored
* Online ≠ reading
* Socket delivery is best-effort; database state is authoritative

---

## Read Receipts — Design

### What “Read” Means

A message is considered **read only when**:

* The receiver opens the conversation
* The message is rendered on screen

Being online alone does not imply reading.

---

## Message Model Extension

The message schema is extended minimally:

* `isRead` — boolean read state
* `readAt` — timestamp of first read

This change is backward-compatible and does not require restructuring existing data.

---

## Read Receipt Flow

1. Receiver opens a chat
2. Client emits `mark_as_read` with `{ senderId }`
3. Server bulk-updates unread messages in DB
4. Server emits `messages_read` to the sender (if online)
5. Sender updates UI to reflect read status

### Why Bulk Updates?

* Fewer database writes
* Less socket traffic
* Simpler logic
* Matches real-world chat applications

---

## Multi-Tab Behavior

* Read state is **user-level**, not tab-level
* Opening a chat in one tab marks messages as read everywhere
* Other tabs sync automatically via socket events

---

## Typing Indicators — Design

Typing indicators are:

* Ephemeral
* Not persisted
* Not guaranteed delivery
* Scoped only to the active chat partner

They are purely a UX enhancement.

---

## Typing Events

### Client → Server

* `typing_start`
* `typing_stop`

Payload:

```json
{ "receiverId": "<user_id>" }
```

### Server → Client

* `user_typing`
* `user_stop_typing`

---

## Debounce Strategy

To avoid socket spam:

* Emit `typing_start` only once per typing session
* Emit `typing_stop` after 500–1000ms of inactivity
* Force `typing_stop` when:

  * Message is sent
  * Input is cleared
  * Chat is switched

Server does not store typing state — it only forwards events.

---

## Failure Scenarios Handled

* Receiver offline → no typing events, read later
* Sender refresh → read state persists (DB)
* Network lag → typing indicators may drop (acceptable)
* Multiple tabs → consistent read behavior

---

## What Was Explicitly NOT Implemented

* Delivery receipts
* Per-message read acknowledgements
* Group chat read logic
* Seen-by lists

These features significantly increase complexity and are deferred.

---

## Validation Checklist

* [x] Read receipts trigger only on chat open
* [x] Read state persists after refresh
* [x] Sender sees read update in real time
* [x] Typing indicator is smooth and flicker-free
* [x] No typing spam in network tab
* [x] Multi-tab behavior is correct

---

## Outcome

A **production-grade implementation** of read receipts and typing indicators that is accurate, efficient, and scalable, providing realistic chat UX without sacrificing correctness.

---

## Next Step

**Day 5 — Delivery Receipts & Reliability Improvements**

