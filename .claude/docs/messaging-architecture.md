# Messaging Architecture Analysis

> Deep-dive into the Agent messaging system architecture.
> Last updated: 2026-01-31

---

## GM-as-Firebase Pattern

The Cyberpunk Agent uses the GM as an authoritative data broker:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FOUNDRY SERVER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ game.settings (World-scoped, GM write-only)                      │   │
│  │ ├── 'server-messages'      → {conversationKey: [messages]}       │   │
│  │ ├── 'server-read-status'   → {userId: {convKey: readData}}       │   │
│  │ ├── 'device-data'          → {deviceId: deviceObject}            │   │
│  │ ├── 'phone-number-data'    → {phoneNumber: deviceId}             │   │
│  │ ├── 'contact-networks'     → {deviceId: [contactIds]}            │   │
│  │ └── 'offline-message-queue'→ {userId: [queuedMessages]}          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            │                   SOCKETLIB                      │
            │  socket.executeAsGM() / socket.executeForAll()   │
            └─────────────────────────────────────────────────┘
```

---

## Message Send Flow

```
Player A sends message to Player B:

Player A                    GM                         Player B
    │                        │                              │
    │ 1. Create message obj  │                              │
    │ 2. Generate messageId  │                              │
    │ 3. Save to localStorage│                              │
    │ ──────────────────────►│                              │
    │    saveMessageToServer │                              │
    │                        │ 4. Validate & save to        │
    │                        │    game.settings             │
    │                        │ 5. If B online:              │
    │                        │ ────────────────────────────►│
    │                        │    sendMessage broadcast     │
    │                        │                              │ 6. Deduplicate
    │                        │                              │ 7. Save localStorage
    │                        │                              │ 8. Show notification
```

---

## Known Issues

### 🔴 HIGH: Race Condition in Concurrent Writes
**Location:** `saveMessageToServerAsGM()` (module.js:5300-5335)

If two players send simultaneously, GM receives both. Each reads `game.settings`, modifies, writes. Second write overwrites first.

**Fix:** Serialize GM write operations.

---

### 🔴 HIGH: Conversation Key Parsing Bug
**Location:** `deleteMessagesFromServerAsGM()` (module.js:8248-8260)

```javascript
const deviceIds = conversationKey.split('-');
const device1 = deviceIds[0];
```

Device IDs contain hyphens (`device-actorId-itemId`), breaking the split.

**Fix:** Use `|` delimiter instead of `-`.

---

### 🔴 HIGH: Stale Cache on Reconnect
When player reconnects, localStorage may have messages deleted on server. Sync merges instead of replacing.

**Fix:** Track deletion timestamps, remove locally deleted messages.

---

### 🟡 MEDIUM: Dual Key Storage
Messages stored under two keys (sender→receiver and receiver→sender). 2x storage, complex sync.

**Fix:** Use single sorted canonical key.

---

### 🟡 MEDIUM: Unread Cache Invalidation
`unreadCounts` Map not cleared on deletion/clear operations.

**Fix:** Clear cache in all mutation paths.

---

## Data Structures

### Message Object
```javascript
{
    id: "device-abc-123-device-def-456-1706712345678-a1b2c3-xyz789",
    senderId: "device-abc-123",
    receiverId: "device-def-456",
    text: "Message content",
    timestamp: 1706712345678,
    time: "14:32",
    read: false
}
```

### Device Object
```javascript
{
    id: "device-{actorId}-{itemId}",
    ownerActorId: "abc123",
    itemId: "def456",
    deviceName: "Agent v2.0",
    ownerName: "Johnny Silverhand",
    img: "path/to/avatar.png",
    contacts: ["device-other-id"],
    settings: { muteAll: false, notificationSounds: true }
}
```

---

## GM Offline Behavior

| Operation | What Happens | Impact |
|-----------|--------------|--------|
| Player joins | Can read cached settings | ✅ Gets data |
| Player sends | Saved to localStorage only | ⚠️ Not synced |
| Player receives | SocketLib fails | ❌ Not delivered |
| Offline queue | Skipped | ❌ Messages stuck |

**Recommendation:** Queue locally, replay when GM returns.
