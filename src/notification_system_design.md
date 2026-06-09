# notification_system_design.md

# Stage 1

# Campus Notification System Design

## Base URL

```txt
/api/v1
```

---

# 1. Create notification

## Endpoint

```http
POST /notifications
```

## Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer token"
}
```

## Request Body

```json
{
  "userId": "uuid",
  "title": "Placement Drive",
  "message": "Amazon placement drive tomorrow",
  "type": "PLACEMENT"
}
```

## Response

```json
{
  "success": true,
  "notificationId": "uuid"
}
```

---

# 2. Get notifications

## Endpoint

```http
GET /notifications?page=1&limit=20
```

## Response

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

# 3. Mark Notification as Read

## Endpoint

```http
PATCH /notifications/:id/read
```

## Response

```json
{
  "success": true
}
```

---

# 4. Delete Notification

## Endpoint

```http
DELETE /notifications/:id
```

## Response

```json
{
  "success": true
}
```

---

# Realtime Notification Design

Use WebSockets for real-time notifications.

Flow:

```txt
Client connects
- WebSocket connection established
- Server pushes notification
- Frontend updates it in realtime
```

---
