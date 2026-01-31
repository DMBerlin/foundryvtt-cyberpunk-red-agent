# Cyberpunk Agent v12 Upgrade Roadmap

> Implementation plan for Foundry v12 upgrade and architectural improvements.
> Last updated: 2026-01-31

---

## Overview

This roadmap covers:
1. Foundry v12 compatibility (✅ Done)
2. Messaging architecture fixes
3. UI live reload improvements
4. Chat notification feature
5. GM offline resilience

---

## Phase 1: Foundation (✅ Complete)

### 1.1 Foundry v12 Compatibility
- [x] Update `module.json` compatibility (v10-v12)
- [x] Update dependency versions (socketlib, cyberpunk-red-core)
- [x] Create symlink for local development
- [x] Create Makefile with `make start`/`make stop`
- [x] Add `.env.local` for environment config

### 1.2 Documentation
- [x] Create `CLAUDE.md` with project context
- [x] Create `.claude/skills.md` with engineering guidelines
- [x] Audit and clean `docs/` folder (removed 9 obsolete files)
- [x] Update version references across docs

### 1.3 Codebase Cleanup
- [x] Remove unused `scripts/contact-search.js`
- [x] Remove unused `templates/chat-preview-notification.html`
- [x] Remove `dev-copy.bat` and `.hintrc`
- [x] Rename `_openContactSearchModal` → `_navigateToAddContact`

---

## Phase 2: UI Live Reload Fix (Priority: 🔴 Critical)

### Problem
Full `render(true)` on every update destroys scroll position and causes visual flicker.

### 2.1 Quick Fix: State Preservation
- [ ] Add `_captureUIState()` method to save scroll/focus before render
- [ ] Add `_restoreUIState()` method to restore after render
- [ ] Modify `_handleUIControllerUpdate()` to use state preservation

```javascript
// Key changes in agent-home.js
_captureUIState() {
    const container = this.element?.find('.cp-messages-container')?.[0];
    return {
        scrollTop: container?.scrollTop,
        scrollHeight: container?.scrollHeight,
        atBottom: container ? (container.scrollTop + container.clientHeight >= container.scrollHeight - 20) : true
    };
}

_restoreUIState(state) {
    setTimeout(() => {
        const container = this.element?.find('.cp-messages-container')?.[0];
        if (container && state.atBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, 0);
}
```

### 2.2 Scroll to Bottom on Conversation Open
- [ ] Add `_scrollToBottom()` helper method
- [ ] Call after conversation navigation completes
- [ ] Call after sending a message

### 2.3 Mark Messages as Read on Open
- [ ] Call `markMessagesAsReadForDevice()` in `navigateTo('conversation')`
- [ ] Clear unread count cache for opened conversation
- [ ] Dispatch update event to refresh contact list badges

---

## Phase 3: UIController Enhancement (Priority: 🟡 High)

### Problem
Current UIController uses single update type, forcing full re-renders.

### 3.1 Add Update Types
- [ ] Modify `markDirty(componentId, updateType)` to accept type
- [ ] Change `dirtyComponents` from Set to Map (componentId → updateType)
- [ ] Pass updateType to callbacks

```javascript
// Key changes in module.js UIController
markDirty(componentId, updateType = 'full') {
    this.dirtyComponents.set(componentId, updateType);
    this.scheduleUpdate();
}
```

### 3.2 Implement Incremental Updates
- [ ] Add `_appendNewMessages()` for 'newMessage' type
- [ ] Add `_updateContactBadges()` for 'unreadCount' type
- [ ] Add `_updateContactList()` for 'contactUpdate' type
- [ ] Only fall back to `render(true)` for 'full' type

### 3.3 Update Callers
- [ ] Change all `markDirty()` calls to include appropriate type
- [ ] Update socket handlers to use specific types
- [ ] Update local event handlers to use specific types

---

## Phase 4: Chat Notifications Feature (Priority: 🟡 High)

### Problem
Users want optional FoundryVTT chat notifications for Agent messages.

### 4.1 Add Player Setting
- [ ] Register `player-chat-notifications` setting (scope: 'client')
- [ ] Default: false (opt-in)
- [ ] Add localization keys

```javascript
game.settings.register('cyberpunk-agent', 'player-chat-notifications', {
    name: game.i18n.localize('CYBERPUNK_AGENT.settings.playerChatNotifications.name'),
    hint: game.i18n.localize('CYBERPUNK_AGENT.settings.playerChatNotifications.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: false
});
```

### 4.2 Implement Notification Function
- [ ] Add `_sendPlayerChatNotification(senderDevice, receiverDevice, text, isSender)`
- [ ] Create whispered ChatMessage to current user only
- [ ] Truncate message preview to 50 chars
- [ ] Use different icons for sent (📤) vs received (📥)

### 4.3 Hook into Message Flow
- [ ] Modify `_sendMessageTrackingNotifications()` to include player notifications
- [ ] Check per-user setting before sending
- [ ] Send to sender (if enabled) and receiver (if enabled)

### 4.4 Add CSS Styling
- [ ] Add `.cyberpunk-agent-chat-notification` styles
- [ ] Match cyberpunk aesthetic (neon, dark background)

---

## Phase 5: GM Offline Resilience (Priority: 🟢 Medium)

### Problem
When GM is offline, players cannot sync messages to server.

### 5.1 Detect GM Status
- [ ] Add `_isGMOnline()` helper method
- [ ] Show "⚠️ Sync Paused" indicator when GM offline
- [ ] Hide indicator when GM returns

### 5.2 Local Write Queue
- [ ] Create `pendingOperations` queue in localStorage
- [ ] Queue writes when GM offline instead of failing
- [ ] Store operation type and payload

### 5.3 Replay on GM Connect
- [ ] Listen for GM user join event
- [ ] Replay queued operations in order
- [ ] Clear queue on successful replay
- [ ] Handle conflicts gracefully

---

## Phase 6: Messaging Architecture Fixes (Priority: 🟢 Medium)

### Problem
Race conditions, duplicate storage, and sync issues.

### 6.1 Serialize GM Writes
- [ ] Add write queue in UIController or separate class
- [ ] Process one `game.settings.set()` at a time
- [ ] Prevent concurrent modifications

### 6.2 Fix Conversation Key Parsing
- [ ] Change delimiter from `-` to `|` for conversation keys
- [ ] Update all `_getDeviceConversationKey()` callers
- [ ] Migrate existing data (one-time upgrade script)

### 6.3 Deletion Sync
- [ ] Add deletion timestamps to messages
- [ ] On sync, compare timestamps to detect server-side deletions
- [ ] Remove locally cached deleted messages

---

## Testing Checklist

### UI Live Reload
- [ ] Open conversation → scrolls to bottom
- [ ] Receive message while viewing → appears, stays at bottom
- [ ] Receive message while scrolled up → maintains position
- [ ] Open conversation with unread → badge resets to 0
- [ ] In contact list, receive message → badge updates smoothly

### Chat Notifications
- [ ] Setting appears in module config (all users)
- [ ] Sender sees "sent" notification (if enabled)
- [ ] Receiver sees "received" notification (if enabled)
- [ ] GM sees all notifications (existing feature)
- [ ] Works when GM offline (client-scoped)

### Sync
- [ ] Player sends while other offline → message delivered on join
- [ ] Both players send simultaneously → both messages appear
- [ ] Player deletes message → syncs to all clients
- [ ] Long conversation (100+ messages) → no performance issues

---

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `scripts/agent-home.js` | 2, 3 | State preservation, incremental updates |
| `scripts/module.js` | 3, 4, 5 | UIController types, notifications, GM detection |
| `scripts/socketlib-integration.js` | 3, 6 | Update types, write serialization |
| `styles/module.css` | 4 | Chat notification styles |
| `lang/en.json` | 4 | Localization keys |
| `lang/pt-BR.json` | 4 | Localization keys |

---

## Commit Strategy

Use conventional commits:
- `fix(ui):` for scroll/render fixes
- `feat(notifications):` for chat notification feature
- `refactor(ui-controller):` for update type changes
- `fix(sync):` for messaging architecture fixes

---

## Notes

- Phase 2 is the highest priority (user-facing bug)
- Phase 4 can be done in parallel with Phase 3
- Phase 6 is a larger refactor, can be deferred if needed
- All phases should include tests before merge
