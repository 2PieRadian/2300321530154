# Stage 1

## Base URL

```txt
/api/v1
```

---

## 1. Create notification

### Endpoint

```http
POST /notifications
```

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer token"
}
```

### Request Body

```json
{
  "userId": "uuid",
  "title": "Placement Drive",
  "message": "Amazon placement drive tomorrow",
  "type": "PLACEMENT"
}
```

### Response

```json
{
  "success": true,
  "notificationId": "uuid"
}
```

---

## 2. Get notifications

### Endpoint

```http
GET /notifications?page=1&limit=20
```

### Response

```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Placement Drive",
      "message": "Amazon placement drive tomorrow",
      "type": "PLACEMENT",
      "isRead": false,
      "createdAt": "timestamp"
    }
  ]
}
```

---

## 3. Mark Notification as Read

### Endpoint

```http
PATCH /notifications/:id/read
```

### Response

```json
{
  "success": true
}
```

---

## 4. Delete Notification

### Endpoint

```http
DELETE /notifications/:id
```

### Response

```json
{
  "success": true
}
```

---

## Realtime Notification Design

Use WebSockets for real-time notifications.

Flow:

```txt
Client connects
- WebSocket connection established
- Server pushes notification
- Frontend updates it in realtime
```

## WebSocket API Design

### WebSocket Endpoint

```txt
ws://localhost:3000/notifications
```

## Authenticate Connection

### Client Event

```json
{
  "event": "AUTHENTICATE",
  "token": "jwt_token"
}
```

### Server Response

```json
{
  "event": "AUTH_SUCCESS"
}
```

## New Notification Event

### Server Event

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "uuid",
    "title": "Placement Drive",
    "message": "Amazon placement drive tomorrow",
    "type": "PLACEMENT"
  }
}
```

---

# Stage 2

First of all, let's assume we use a NoSQL Database, because we have to start from somewhere to decide what's the best db for this design right?

Now suppose we have a NoSQL database for this notification system design, for eg. MongoDB. Now MongoDB is a nosql db which is highly optimized for flexible schema structure. But when we are talking about a notification system, it has a fixed, definite structure. That is exactly the reason SQL databases are for, no?

To add on, if we use a SQL databse then we can take advantage of the ACID principles. ACID ensures we have reliable updates throughout the schema, be it marking a notification as read, or deleting a notification.

## Why PostgreSQL?

PostgreSQL is preferred for this notification system because it provides a strong reliability, scalability, advanced querying capabilities, and production grade features. Compared to the other SQL Databases, PostgreSQL has more advanced indexing and query optimization features, which are useful for filtering and pagination of notifications.

Also PostgreSQL is highly stable and widely used in large scale production systems, for eg. Reddit uses PostgreSQL for storing posts, comments, and user related data.

---

## Database Schema

### notifications table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Indexes

```sql
CREATE INDEX idx_user_notifications
ON notifications(user_id);
```

---

## Queries

### Get unread notifications

```sql
SELECT *
FROM notifications
WHERE user_id = ?
AND is_read = false;
```

---

### Mark notification as read

```sql
UPDATE notifications
SET is_read = true
WHERE id = ?;
```

---

## Problems as Data Grows

Possible issues:

- millions of notifications
- slow queries
- increased traffic
- websocket scaling problems

---

## Solutions

- pagination
- indexing
- Redis caching
- Kafka/RabbitMQ
- horizontal scaling
- database partitioning

---

# Stage 3

## Existing Query

```sql id="n0smf3"
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

This query is correct, but it becomes slow because the table contains millions of notifications.

## Solution

Use a composite index:

```sql id="3r92pn"
CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt DESC);
```

This helps the database find notifications faster and improves sorting performance.

## Why Not Add Indexes on Every Column?

Adding indexes on every column is not a good idea because:

- indexes use extra storage
- inserts become slower
- updates become slower

Indexes should only be added on columns that are searched frequently.

## Query for Placement Notifications in Last 7 Days

```sql id="1fqf17"
SELECT *
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4

Currently, notifications are fetched every time the page loads. This increases database traffic and slows down the system.

## Improvements

### Pagination

Load notifications in small batches.

Example:

```txt id="ys65p5"
?page=1&limit=20
```

### Redis Cache

Store frequently used notifications in Redis to reduce database load.

### Lazy Loading

Load notifications only when the user opens the notification section.

### WebSockets

Send notifications in realtime instead of repeatedly asking the server for updates.

## Tradeoffs

| Method       | Drawback                                 |
| ------------ | ---------------------------------------- |
| Pagination   | more API requests                        |
| Redis Cache  | cache management becomes harder          |
| WebSockets   | maintaining live connections             |
| Lazy Loading | slight delay while opening notifications |

---

# Stage 5

## Problems in Existing Design

- notifications are processed one by one
- email failures can cause issues
- no retry system
- slow for 50,000 students
- tightly connected operations

## Better Design

Use queues and workers.

Flow:

```txt id="w8xmtw"
Request
→ Queue
→ Worker
→ Save Notification
→ Send Email
→ Push Realtime Notification
```

## Why Separate DB Save and Email?

Emails may fail because email services are external systems.

Even if email fails, notifications should still be saved in the database.

## Revised Pseudocode

```js id="mdgddq"
async function notifyAll(studentIds, message) {
  for (const studentId of studentIds) {
    try {
      await saveNotification(studentId, message);

      await sendEmail(studentId, message);

      await pushRealtimeNotification(studentId, message);
    } catch (error) {
      logFailure(studentId, error);

      retryFailedNotification(studentId, message);
    }
  }
}
```

---

# Stage 6

## Approach

Priority depends on:

- notification type
- how recent the notification is

Priority order:

```txt id="itmwgv"
Placement > Result > Event
```

Newer notifications get higher priority.

## Solution

Each notification gets a priority score.

Example:

```txt id="kkj80w"
priorityScore =
typeWeight + recencyWeight
```

## Efficient Top 10 Management

Use a Min Heap of size 10.

This helps:

- quickly maintain top 10 notifications
- avoid sorting all notifications again and again
- improve performance

## Example Node.js Code

```js id="s9e9k6"
const typeWeights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function calculatePriority(notification) {
  const typeScore = typeWeights[notification.type];

  const hoursOld =
    (Date.now() - new Date(notification.createdAt)) / (1000 * 60 * 60);

  const recencyScore = Math.max(0, 24 - hoursOld);

  return typeScore * 10 + recencyScore;
}

function getTopNotifications(notifications, n = 10) {
  return notifications
    .map((notification) => ({
      ...notification,
      priority: calculatePriority(notification),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, n);
}
```

## Maintaining Top 10 Efficiently

When a new notification arrives:

- calculate its priority
- compare it with the lowest priority in heap
- replace it if the new one has higher priority

This avoids sorting all notifications repeatedly.
