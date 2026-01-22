# WEEK 4 — User Discovery, Contacts & Deployment Kickoff

## Goal
Enable users to discover other users, initiate direct messages securely using E2EE, persist contacts only on real interaction, and begin deployment preparation.

This week focuses on **intent-based chat creation**, **contact persistence on first message**, and **production readiness**.

---

## FEATURE 1: Search User & Initiate DM

### Objective
Allow User A to search User B by **email or username** and initiate a secure DM without polluting contacts or database state.

---

### Flow Overview

1. User A searches User B (email / username)
2. User A clicks **Send Message**
3. AES keys are exchanged symmetrically
4. If User A sends a message:
   - User B is added to A’s contacts
   - User A is added to B’s contacts
5. If no message is sent:
   - AES keys remain unused and are cleaned up later

---

### Implementation Details

#### Search
- Read-only operation
- Case-insensitive
- Exact match only
- Prevent self-search

No database writes during search.

---

#### Send Message Button (Key Exchange Trigger)
- AES key is generated and exchanged symmetrically
- Key stored with metadata:
  - `used = false`
  - `createdAt`

This represents **intent to communicate**, not an actual conversation yet.

---

#### First Message Send (Contact Creation Trigger)

On `sendMessage`:
- Check if AES key `used == false`
- If true:
  - Add users to each other’s contacts
  - Mark AES key as `used = true`
- Encrypt message using AES
- Deliver message to receiver

This ensures:
- Contacts are created **only on real interaction**
- No repeated contact checks on subsequent messages

---

#### Idempotency Rules
- Contacts table enforces uniqueness:




- Prevents race conditions and duplicate inserts

---

## FEATURE 2: Cleanup of Unused AES Keys

### Problem
AES keys may exist if a user clicks **Send Message** but never sends a message.

This is not a security issue, but must be cleaned to avoid DB clutter.

---

### Solution: TTL-based Cleanup Job

#### Key Metadata
- `used: boolean`
- `createdAt: timestamp`

#### Cleanup Rule
Delete unused keys older than a fixed TTL (e.g., 24 hours).

```sql
DELETE FROM aes_keys
WHERE used = false
AND created_at < NOW() - INTERVAL '24 hours';
