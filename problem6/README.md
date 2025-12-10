# Problem 5 - Live Scoreboard API Module Specification

## Overview

This document specifies the design and implementation requirements for a **Live Scoreboard API Module**. The module manages user scores, provides real-time leaderboard updates, and ensures secure score submissions.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Flow Diagrams](#flow-diagrams)
3. [API Specification](#api-specification)
4. [Data Models](#data-models)
5. [Security Requirements](#security-requirements)
6. [Real-time Updates](#real-time-updates)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Improvement Suggestions](#improvement-suggestions)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│   │   Website    │         │  WebSocket   │         │   Action     │        │
│   │  (Scoreboard)│◄───────►│   Client     │         │   Trigger    │        │
│   └──────────────┘         └──────────────┘         └──────┬───────┘        │
│                                   ▲                        │                 │
└───────────────────────────────────┼────────────────────────┼─────────────────┘
                                    │                        │
                                    │ WebSocket              │ HTTPS + JWT
                                    │ (Live Updates)         │ (Score Update)
                                    │                        │
┌───────────────────────────────────┼────────────────────────┼─────────────────┐
│                              API LAYER                     │                 │
├───────────────────────────────────┼────────────────────────┼─────────────────┤
│                                   │                        ▼                 │
│   ┌───────────────────────────────┴────────────────────────────────────┐     │
│   │                        API Gateway                                 │     │
│   │                  (Rate Limiting, Auth Validation)                  │     │
│   └───────────────────────────────┬────────────────────────────────────┘     │
│                                   │                                          │
│                                   ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                     Application Server                              │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│   │  │   Auth      │  │   Score     │  │ Leaderboard │  │  WebSocket │  │    │
│   │  │  Middleware │  │   Service   │  │   Service   │  │   Handler  │  │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────────────┐
│                              DATA LAYER                                      │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                                   ▼                                          │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      │
│   │   PostgreSQL    │      │     Redis       │      │  Message Queue  │      │
│   │   (Persistent   │      │   (Cache +      │      │   (Pub/Sub for  │      │
│   │    Storage)     │      │   Leaderboard)  │      │   Broadcasting) │      │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Diagrams

### 1. Score Update Flow

```
┌────────┐     ┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌───────────┐
│  User  │     │  Client │     │ API Server │     │Score Service│     │  Database │
└───┬────┘     └────┬────┘     └─────┬──────┘     └──────┬──────┘     └─────┬─────┘
    │               │                │                   │                  │
    │ Complete      │                │                   │                  │
    │ Action        │                │                   │                  │
    │──────────────►│                │                   │                  │
    │               │                │                   │                  │
    │               │ POST /api/score│                   │                  │
    │               │ + JWT Token    │                   │                  │
    │               │ + Action Proof │                   │                  │
    │               │───────────────►│                   │                  │
    │               │                │                   │                  │
    │               │                │ Validate JWT      │                  │
    │               │                │──────────────────►│                  │
    │               │                │                   │                  │
    │               │                │ Verify Action     │                  │
    │               │                │ (Anti-cheat)      │                  │
    │               │                │──────────────────►│                  │
    │               │                │                   │                  │
    │               │                │                   │ Update Score     │
    │               │                │                   │─────────────────►│
    │               │                │                   │                  │
    │               │                │                   │ Score Updated    │
    │               │                │                   │◄─────────────────│
    │               │                │                   │                  │
    │               │                │ Update Redis      │                  │
    │               │                │ Leaderboard       │                  │
    │               │                │──────────────────►│                  │
    │               │                │                   │                  │
    │               │                │ Broadcast via     │                  │
    │               │                │ WebSocket         │                  │
    │               │                │──────────────────►│                  │
    │               │                │                   │                  │
    │               │ 200 OK         │                   │                  │
    │               │◄───────────────│                   │                  │
    │               │                │                   │                  │
    │ Score Updated │                │                   │                  │
    │◄──────────────│                │                   │                  │
    │               │                │                   │                  │
```

### 2. Live Scoreboard Update Flow

```
┌────────────────┐     ┌─────────────────┐     ┌────────────────┐     ┌─────────────┐
│ Scoreboard     │     │ WebSocket       │     │ Application    │     │   Redis     │
│ Client         │     │ Connection      │     │ Server         │     │   Pub/Sub   │
└───────┬────────┘     └────────┬────────┘     └───────┬────────┘     └──────┬──────┘
        │                       │                      │                     │
        │ Connect WebSocket     │                      │                     │
        │──────────────────────►│                      │                     │
        │                       │ Establish Connection │                     │
        │                       │─────────────────────►│                     │
        │                       │                      │                     │
        │                       │                      │ Subscribe to        │
        │                       │                      │ "leaderboard"       │
        │                       │                      │────────────────────►│
        │                       │                      │                     │
        │ Initial Top 10        │                      │                     │
        │◄──────────────────────│◄─────────────────────│                     │
        │                       │                      │                     │
        │                       │    ... time passes, another user updates score ...
        │                       │                      │                     │
        │                       │                      │ Publish: Leaderboard│
        │                       │                      │ Changed             │
        │                       │                      │◄────────────────────│
        │                       │                      │                     │
        │                       │ Push: Updated Top 10 │                     │
        │                       │◄─────────────────────│                     │
        │                       │                      │                     │
        │ Render Updated        │                      │                     │
        │ Scoreboard            │                      │                     │
        │◄──────────────────────│                      │                     │
        │                       │                      │                     │
```

### 3. Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           SCORE UPDATE REQUEST FLOW                            │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐                                                      ┌─────────────┐
  │ Request │                                                      │   Response  │
  │ Arrives │                                                      │   Sent      │
  └────┬────┘                                                      └──────▲──────┘
       │                                                                  │
       ▼                                                                  │
  ┌─────────────────┐    NO     ┌─────────────────┐                       │
  │ Has Valid JWT?  │─────────► │ 401 Unauthorized │──────────────────────┤
  └────────┬────────┘           └─────────────────┘                       │
           │ YES                                                          │
           ▼                                                              │
  ┌─────────────────┐    NO     ┌─────────────────┐                       │
  │ Rate Limit OK?  │─────────► │ 429 Too Many    │──────────────────────-┤
  └────────┬────────┘           │     Requests    │                       │
           │ YES                └─────────────────┘                       │
           ▼                                                              │
  ┌─────────────────┐    NO     ┌─────────────────┐                       │
  │ Valid Action    │─────────► │ 400 Bad Request │──────────────────────-┤
  │ Proof/Token?    │           │ (Invalid Action)│                       │
  └────────┬────────┘           └─────────────────┘                       │
           │ YES                                                          │
           ▼                                                              │
  ┌─────────────────┐    NO     ┌─────────────────┐                       │
  │ Action Already  │─────────► │ 409 Conflict    │──────────────────────-┤
  │ Processed?      │           │ (Duplicate)     │                       │
  └────────┬────────┘           └─────────────────┘                       │
           │ NO (First time)                                              │
           ▼                                                              │
  ┌─────────────────┐                                                     │
  │ Process Score   │                                                     │
  │ Update          │────────────────────────────────────────────────────-┘
  └─────────────────┘
           │
           ▼
  ┌─────────────────┐
  │ 200 OK          │
  │ (Score Updated) │
  └─────────────────┘
```

---

## API Specification

### Base URL
```
https://api.example.com/v1
```

### Endpoints

#### 1. Update User Score

**POST** `/score`

Updates the user's score after completing an action.

**Headers:**
| Header          | Type   | Required | Description                          |
|-----------------|--------|----------|--------------------------------------|
| Authorization   | string | Yes      | Bearer JWT token                     |
| X-Action-Token  | string | Yes      | Signed token proving action validity |
| X-Request-ID    | string | No       | Unique request identifier            |

**Request Body:**
```json
{
  "actionId": "string",       // Unique identifier for the action
  "actionType": "string",     // Type of action completed
  "timestamp": "number",      // Unix timestamp of action completion
  "scoreIncrement": "number", // Points to add (server validates max allowed)
  "signature": "string"       // HMAC signature of the payload
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "newScore": "number",
    "previousScore": "number",
    "rank": "number",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

| Status | Code                 | Description                              |
|--------|----------------------|------------------------------------------|
| 400    | INVALID_PAYLOAD      | Missing or invalid request parameters    |
| 400    | INVALID_SIGNATURE    | Payload signature verification failed    |
| 401    | UNAUTHORIZED         | Missing or invalid JWT token             |
| 403    | FORBIDDEN            | User not allowed to perform this action  |
| 409    | DUPLICATE_ACTION     | Action has already been processed        |
| 429    | RATE_LIMITED         | Too many requests from this user         |
| 500    | INTERNAL_ERROR       | Server error                             |

---

#### 2. Get Leaderboard

**GET** `/leaderboard`

Retrieves the top 10 users on the scoreboard.

**Query Parameters:**
| Parameter | Type   | Default | Description                     |
|-----------|--------|---------|----------------------------------|
| limit     | number | 10      | Number of entries (max 100)      |
| offset    | number | 0       | Pagination offset                |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "string",
        "username": "string",
        "score": "number",
        "updatedAt": "string"
      }
    ],
    "total": "number",
    "lastUpdated": "string"
  }
}
```

---

#### 3. Get User Score & Rank

**GET** `/score/me`

Retrieves the authenticated user's current score and rank.

**Headers:**
| Header        | Type   | Required | Description      |
|---------------|--------|----------|------------------|
| Authorization | string | Yes      | Bearer JWT token |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "username": "string",
    "score": "number",
    "rank": "number",
    "updatedAt": "string"
  }
}
```

---

### WebSocket Events

**Connection URL:**
```
wss://api.example.com/ws/leaderboard
```

#### Server → Client Events

| Event               | Payload                              | Description                        |
|---------------------|--------------------------------------|------------------------------------|
| `leaderboard:init`  | `{ leaderboard: User[], total: n }` | Initial top 10 on connection       |
| `leaderboard:update`| `{ leaderboard: User[], changed: [] }` | Updated leaderboard when changed |
| `score:updated`     | `{ userId, newScore, rank }`        | Specific user's score changed      |

#### Client → Server Events

| Event               | Payload           | Description                    |
|---------------------|-------------------|--------------------------------|
| `subscribe`         | `{ token: JWT }`  | Subscribe to leaderboard updates |
| `unsubscribe`       | `{}`              | Stop receiving updates         |

---

## Data Models

### User Score Entity

```typescript
interface UserScore {
  id: string;              // Primary key (UUID)
  userId: string;          // Foreign key to User
  score: number;           // Current total score
  actionsCount: number;    // Number of actions completed
  lastActionAt: Date;      // Timestamp of last action
  createdAt: Date;
  updatedAt: Date;
}
```

### Action Log Entity

```typescript
interface ActionLog {
  id: string;              // Primary key (UUID)
  userId: string;          // Foreign key to User
  actionId: string;        // Unique action identifier (for deduplication)
  actionType: string;      // Type of action
  scoreIncrement: number;  // Points awarded
  clientTimestamp: Date;   // When client reported action
  serverTimestamp: Date;   // When server processed action
  ipAddress: string;       // For audit/security
  userAgent: string;       // For audit/security
  isValid: boolean;        // Whether action passed validation
}
```

### Redis Leaderboard Structure

```
Key: "leaderboard:global"
Type: Sorted Set
Score: User's total score
Member: userId

Commands:
- ZADD leaderboard:global <score> <userId>       # Add/update score
- ZREVRANGE leaderboard:global 0 9 WITHSCORES    # Get top 10
- ZREVRANK leaderboard:global <userId>           # Get user's rank
```

---

## Security Requirements

### 1. Authentication

- All score update requests MUST include a valid JWT token
- JWT must contain: `userId`, `sessionId`, `exp` (expiration)
- Token expiration: 15 minutes (short-lived)
- Implement refresh token rotation

### 2. Action Verification

```typescript
// Action token structure
interface ActionToken {
  actionId: string;      // UUID - unique per action
  actionType: string;    // Action category
  userId: string;        // Must match JWT userId
  timestamp: number;     // Must be within acceptable window
  nonce: string;         // Random value for uniqueness
  signature: string;     // HMAC-SHA256(payload, serverSecret)
}
```

**Verification Steps:**
1. Verify JWT is valid and not expired
2. Verify action signature using server secret
3. Check timestamp is within acceptable window (±30 seconds)
4. Check actionId has not been processed before (idempotency)
5. Verify userId in action matches JWT userId

### 3. Rate Limiting

| Endpoint        | Limit              | Window    |
|-----------------|--------------------|-----------|
| POST /score     | 10 requests        | 1 minute  |
| GET /leaderboard| 60 requests        | 1 minute  |
| WebSocket       | 1 connection       | per user  |

### 4. Anti-Cheat Measures

- **Server-side score calculation**: Never trust client-provided score values
- **Action deduplication**: Store processed actionIds to prevent replay attacks
- **Timestamp validation**: Reject actions with timestamps too far from server time
- **Behavioral analysis**: Flag suspicious patterns (too fast, perfect scores)
- **IP-based throttling**: Additional limits per IP address

---

## Real-time Updates

### Implementation Strategy

1. **Use Redis Pub/Sub** for broadcasting leaderboard changes
2. **Debounce updates**: Batch rapid score changes (100ms window)
3. **Delta updates**: Send only changed entries, not full leaderboard
4. **Connection heartbeat**: Ping every 30 seconds to maintain connection

### Broadcast Logic

```typescript
// Pseudo-code for broadcasting updates
async function onScoreUpdate(userId: string, newScore: number) {
  // Update Redis sorted set
  await redis.zadd('leaderboard:global', newScore, userId);
  
  // Check if user is in top 10
  const rank = await redis.zrevrank('leaderboard:global', userId);
  
  if (rank !== null && rank < 10) {
    // User is in top 10 - broadcast update
    const leaderboard = await getTop10();
    
    // Publish to all connected clients
    await redis.publish('leaderboard:updates', JSON.stringify({
      type: 'leaderboard:update',
      data: { leaderboard }
    }));
  }
}
```

---

## Implementation Guidelines

### Technology Recommendations

| Component         | Recommended Technology          |
|-------------------|---------------------------------|
| Runtime           | Node.js (v18+) or Go            |
| Framework         | Express.js / Fastify / Gin      |
| Database          | PostgreSQL                      |
| Cache/Leaderboard | Redis (Sorted Sets)             |
| WebSocket         | Socket.io / ws                  |
| Message Queue     | Redis Pub/Sub or RabbitMQ       |
| Authentication    | JWT (jsonwebtoken)              |

### Project Structure

```
src/
├── config/              # Configuration management
├── controllers/         # HTTP request handlers
│   ├── score.controller.ts
│   └── leaderboard.controller.ts
├── services/            # Business logic
│   ├── score.service.ts
│   ├── leaderboard.service.ts
│   └── action-validator.service.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   ├── rate-limiter.middleware.ts
│   └── action-verifier.middleware.ts
├── models/              # Data models & DTOs
├── repositories/        # Database access layer
├── websocket/           # WebSocket handlers
│   └── leaderboard.handler.ts
├── utils/               # Utility functions
│   ├── crypto.ts
│   └── redis.ts
└── index.ts             # Application entry point
```

### Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## Improvement Suggestions

### 1. **Horizontal Scalability**

> **Problem**: Single server WebSocket connections don't scale.
> 
> **Solution**: Use Redis Pub/Sub or a dedicated message broker (e.g., RabbitMQ) to broadcast events across multiple server instances. Consider using Socket.io with Redis adapter.

### 2. **Leaderboard Caching Strategy**

> **Problem**: Frequent leaderboard queries can overload Redis.
> 
> **Solution**: Implement multi-tier caching:
> - L1: In-memory cache (10s TTL) for GET requests
> - L2: Redis sorted set (source of truth)
> - Only invalidate on actual top 10 changes

### 3. **Action Queue Processing**

> **Problem**: Synchronous score updates can cause latency spikes.
> 
> **Solution**: Implement async processing with a message queue:
> 1. Accept action → validate → queue for processing → return 202 Accepted
> 2. Background worker processes queue and updates scores
> 3. WebSocket notifies client when score is updated

### 4. **Advanced Anti-Cheat System**

> **Problem**: Sophisticated cheaters can bypass basic validation.
> 
> **Suggestions**:
> - Implement server-side action simulation/replay
> - Use machine learning for anomaly detection
> - Add device fingerprinting
> - Implement periodic score reconciliation
> - Add manual review queue for suspicious accounts

### 5. **Graceful Degradation**

> **Problem**: Real-time features should not break core functionality.
> 
> **Solution**:
> - If Redis is down: fall back to DB queries (with higher latency)
> - If WebSocket fails: client polls /leaderboard every 5 seconds
> - Implement circuit breakers for external dependencies

### 6. **Audit Logging**

> **Recommendation**: Log all score-changing events with:
> - Full request details (headers, body, IP)
> - Validation results
> - Before/after scores
> - Processing time
> 
> Store in append-only log for compliance and dispute resolution.

### 7. **Score Decay / Time-Based Scoring** (Optional)

> **Enhancement**: Consider implementing score decay to encourage continued engagement:
> - Scores gradually decrease over time if user is inactive
> - Or implement seasonal/weekly leaderboards that reset

### 8. **Monitoring & Alerting**

> **Recommendation**: Implement comprehensive monitoring:
> - Latency percentiles for score updates (p50, p95, p99)
> - WebSocket connection counts
> - Rate limit hits
> - Failed validation counts (potential attack indicator)
> - Leaderboard query performance

---

## Summary

This specification outlines a secure, scalable, and real-time scoreboard system. Key features include:

- ✅ JWT-based authentication
- ✅ Signed action tokens for score verification
- ✅ Redis-based leaderboard for fast ranking
- ✅ WebSocket for real-time updates
- ✅ Rate limiting and anti-cheat measures
- ✅ Idempotent score updates

The backend team should prioritize security (authentication, action verification) before implementing real-time features. Start with a simple polling-based leaderboard, then add WebSocket support once the core API is stable.
