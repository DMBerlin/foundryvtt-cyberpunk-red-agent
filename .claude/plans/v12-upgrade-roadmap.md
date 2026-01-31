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

## Phase 7: Manual Testing Protocol (Priority: 🔴 Critical)

### Prerequisites
- [ ] Foundry v12 running locally (`make start`)
- [ ] Module symlinked and active
- [ ] At least 2 user accounts (GM + Player)
- [ ] Cyberpunk RED Core system active
- [ ] SocketLib module installed

### Test 1: Device Creation and Binding

**Setup:**
1. [ ] Create a new actor (Character type)
2. [ ] Assign actor ownership to a player user

**Test Steps:**
1. [ ] Open actor sheet
2. [ ] Add a new "Gear" item named "Agent" (or containing "agent" in name)
3. [ ] Verify device is created in registry (check console for "Agent item created")
4. [ ] Equip the Agent item (set equipped = true)
5. [ ] Verify phone number is generated
6. [ ] Check scene controls toolbar for Agent icon

**Expected Results:**
- Device ID format: `device-{actorId}-{itemId}`
- Phone number assigned and persisted
- Toolbar icon appears (may require switching control tabs)

**Known Issue:** Toolbar icon doesn't appear immediately - requires tab switch.

---

### Test 2: Agent UI Navigation

**Test Steps:**
1. [ ] Click Agent icon in toolbar (or "Agent" button in actor sheet header)
2. [ ] Verify home screen loads with phone UI
3. [ ] Navigate to Chat7 (contacts list)
4. [ ] Verify empty state message shows
5. [ ] Navigate back to home

**Expected Results:**
- Smooth transitions between views
- No console errors
- Back button works correctly

---

### Test 3: Adding Contacts

**Setup:**
- Create second actor with Agent equipped
- Assign to different player (or use GM)

**Test Steps:**
1. [ ] Open Agent 1
2. [ ] Navigate to Add Contact
3. [ ] Search by phone number of Agent 2
4. [ ] Add contact
5. [ ] Verify contact appears in Chat7 list

**Expected Results:**
- Contact added successfully
- Both devices have reciprocal contact (bidirectional)
- UI updates without refresh

---

### Test 4: Messaging Flow

**Test Steps:**
1. [ ] Open conversation with contact
2. [ ] Send message "Test message 1"
3. [ ] Verify message appears immediately
4. [ ] Check receiver's Agent - message should appear
5. [ ] Reply from receiver
6. [ ] Verify sender sees reply

**Expected Results:**
- Messages appear in real-time (SocketLib)
- Both sides see conversation history
- Timestamps are correct
- Message order is preserved

---

### Test 5: Scroll Behavior (Known Bug)

**Test Steps:**
1. [ ] Send 20+ messages in a conversation
2. [ ] Scroll up to view older messages
3. [ ] Receive new message from contact
4. [ ] Observe scroll position

**Expected Results (Current - Broken):**
- Scroll jumps to top ❌

**Expected Results (After Fix):**
- Scroll maintains position or scrolls to bottom if user was at bottom ✅

---

### Test 6: Unread Count

**Test Steps:**
1. [ ] From Agent 1, send message to Agent 2
2. [ ] Don't open Agent 2's conversation
3. [ ] Check Agent 2's Chat7 list for unread badge
4. [ ] Open conversation
5. [ ] Go back to Chat7 list
6. [ ] Verify badge is cleared

**Expected Results:**
- Unread badge shows count
- Badge clears after viewing conversation

---

### Test 7: Offline Message Delivery

**Test Steps:**
1. [ ] Player 2 closes browser (goes offline)
2. [ ] Player 1 sends message to Player 2
3. [ ] Player 2 opens browser and logs back in
4. [ ] Check if message was delivered

**Expected Results:**
- Message appears in Player 2's Agent
- Notification shown for offline message

---

### Test 8: GM Management Functions

**Test Steps:**
1. [ ] Open module settings → GM Chat7 Management
2. [ ] Test "Synchronize All Devices"
3. [ ] Verify all devices have phone numbers
4. [ ] Test "Clear All Messages" (use test world!)
5. [ ] Verify messages cleared for all users

**Expected Results:**
- Sync completes with summary
- Messages cleared from server AND localStorage
- All clients notified

---

### Test 9: ZMail System

**Test Steps:**
1. [ ] Open module settings → ZMail Management
2. [ ] Send ZMail to a player device
3. [ ] As player, open Agent → ZMail
4. [ ] Verify message received
5. [ ] Mark as read

**Expected Results:**
- ZMail delivered
- Shows in player's ZMail inbox
- Read status persists

---

### Test 10: Multi-Device Scenario

**Setup:**
- One actor with 2 Agent items equipped

**Test Steps:**
1. [ ] Open toolbar Agent icon
2. [ ] Verify device selection menu appears
3. [ ] Select each device
4. [ ] Verify different phone numbers

**Expected Results:**
- Menu shows all equipped devices
- Each device has unique phone number
- Messages are device-specific, not actor-specific

---

## Agent Access UX Improvements

### Current State Analysis

**How Agent is accessed today:**

| Access Point | Trigger | Issue |
|--------------|---------|-------|
| Scene Controls Toolbar | `getSceneControlButtons` hook | Icon doesn't appear immediately |
| Actor Sheet Header | `renderActorSheet` hook | Only visible when sheet is open |

**Why toolbar icon doesn't appear immediately:**

```javascript
// The hook fires, but ui.controls.render() doesn't always refresh visually
Hooks.on('updateItem', (item, changes) => {
    setTimeout(() => {
        this.updateTokenControls();  // Adds button
        ui.controls.render();        // Supposed to refresh - often doesn't
    }, 100);
});
```

**Root Cause:** FoundryVTT's `ui.controls.render()` may not visually update if the active control category hasn't changed.

---

### Multi-Actor Selection Behavior

**Current Implementation (Already Working):**

When a user controls multiple actors with equipped Agents, the existing `openAgentInterface()` method handles this gracefully:

```javascript
// From module.js lines 3554-3582
async openAgentInterface() {
    const devices = this.getUserAccessibleDevices();
    
    if (devices.length === 0) {
        ui.notifications.warn("No agent found...");
        return;
    }
    
    if (devices.length === 1) {
        // Single device: open directly
        await this.showAgentHome(devices[0]);
    } else {
        // Multiple devices: show selection dialog
        await this.showEquippedAgentMenu(devices);
    }
}
```

**Selection Dialog (showEquippedAgentMenu):**
- Shows a dropdown with all equipped Agents
- Format: `"ActorName: (555) 123-4567"`
- User selects which Agent to open
- GM sees ALL devices in the world

**This means:**
- ✅ Ctrl+P (hotkey) → calls `openAgentInterface()` → shows selection if multiple
- ✅ FAB click → calls `openAgentInterface()` → shows selection if multiple
- ✅ Token HUD → opens Agent for THAT specific token's actor (no dialog needed)

---

### Proposed UX Improvements

#### Option 1: Floating Action Button (FAB)

Add a persistent floating button when Agent is equipped:

```javascript
_addFloatingAgentButton() {
    // Remove existing
    $('#cyberpunk-agent-fab').remove();
    
    const equippedAgents = this.getEquippedAgentsForUser();
    if (equippedAgents.length === 0 && !game.user.isGM) return;
    
    const fab = $(`
        <div id="cyberpunk-agent-fab" title="Open Agent">
            <i class="fas fa-mobile-alt"></i>
        </div>
    `);
    
    fab.on('click', () => this.openAgentInterface());  // Shows dialog if multiple
    $('body').append(fab);
}
```

**CSS:**
```css
#cyberpunk-agent-fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}
```

**Behavior:** Click → If 1 agent, opens it. If multiple, shows selection dialog.
**Pros:** Always visible, cyberpunk aesthetic
**Cons:** Takes screen space, might conflict with other modules

---

#### Option 2: Hotkey Binding

Register a keybinding to open Agent:

```javascript
Hooks.once('init', () => {
    game.keybindings.register('cyberpunk-agent', 'openAgent', {
        name: 'Open Agent Interface',
        hint: 'Opens your equipped Agent device',
        editable: [{ key: 'KeyP', modifiers: ['Control'] }],  // Ctrl+P
        onDown: () => {
            window.CyberpunkAgent?.instance?.openAgentInterface();  // Shows dialog if multiple
            return true;
        }
    });
});
```

**Behavior:** Ctrl+P → If 1 agent, opens it. If multiple, shows selection dialog.
**Pros:** No UI clutter, power-user friendly
**Cons:** Not discoverable, users need to know the key

---

#### Option 3: Token HUD Button

Add Agent button to token HUD (right-click menu):

```javascript
Hooks.on('renderTokenHUD', (hud, html, data) => {
    const token = hud.object;
    const actor = token.actor;
    
    if (!actor?.isOwner) return;
    
    const hasAgent = this._actorHasEquippedAgent(actor);
    if (!hasAgent) return;
    
    const button = $(`
        <div class="control-icon cyberpunk-agent-hud" title="Open Agent">
            <i class="fas fa-mobile-alt"></i>
        </div>
    `);
    
    // Opens Agent for THIS specific actor - no dialog needed
    button.on('click', () => {
        this.openAgentForActor(actor.id);
    });
    
    html.find('.right').append(button);
});
```

**Behavior:** Contextual - opens Agent for the specific token's actor, no selection dialog needed.
**Pros:** Contextual (appears on token), intuitive for that actor
**Cons:** Requires token on scene, right-click to access

---

#### Option 4: Fix Existing Toolbar (Recommended First Step)

Force toolbar refresh more aggressively:

```javascript
async updateTokenControls() {
    try {
        if (!ui.controls?.controls) return;
        
        // Add button
        this.addControlButton(ui.controls.controls);
        
        // Force active control to token
        const currentActive = ui.controls.activeControl;
        
        // Toggle away and back to force re-render
        ui.controls.activeControl = 'lighting';
        await ui.controls.render(true);
        
        ui.controls.activeControl = currentActive;
        await ui.controls.render(true);
        
    } catch (error) {
        console.error("Cyberpunk Agent | Error updating token controls:", error);
    }
}
```

---

### Recommendation

**Phase 1 (Quick):**
- Fix existing toolbar refresh issue
- Add hotkey binding (Ctrl+P or configurable) - low effort, high discoverability in settings

**Phase 2 (Better UX):**
- Add FAB as optional setting (disabled by default)
- Add Token HUD button for contextual access

**Implementation Order:**
1. Fix toolbar refresh (existing code fix)
2. Add keybinding (low effort, high value)
3. Add Token HUD button (contextual, actor-specific)
4. Add FAB as optional feature (medium effort)

---

### Files to Modify

| File | Changes |
|------|---------|
| `scripts/module.js` | Fix `updateTokenControls()`, add FAB, add keybinding, add Token HUD hook |
| `styles/module.css` | Add FAB styles |
| `lang/*.json` | Add keybinding labels |

---

## Notes

- Phase 2 is the highest priority (user-facing bug)
- Phase 4 can be done in parallel with Phase 3
- Phase 6 is a larger refactor, can be deferred if needed
- All phases should include tests before merge

---

## GM Chat7 Management System Analysis

### Current State

The GM Management System provides administrative tools via module settings menu:

**GMDataManagementMenu** (module.js:1217-1393):
- Clear All Messages
- Clear All Contact Lists
- Synchronize All Devices
- Master Reset System

**GMZMailManagementApplication** (gm-zmail-management.js):
- Send ZMail to players
- View all ZMail messages
- Mark all as read
- Clear old messages

### Issues Identified

#### 🔴 HIGH: `clearAllMessages()` Only Clears GM's localStorage

**Location:** module.js:9162-9240

```javascript
// This only clears the GM's localStorage, not players'!
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cyberpunk-agent-messages-')) {
        keysToRemove.push(key);
    }
}
```

**Problem:** `localStorage` is per-browser. GM can't access players' localStorage. The socket notification is sent, but players need to handle `allMessagesCleared` event.

**Fix:** Verify `handleAllMessagesCleared` properly clears player localStorage (it's registered but implementation unclear).

---

#### 🔴 HIGH: Server Messages Not Cleared

**Location:** module.js:9162-9240

`clearAllMessages()` clears localStorage and memory, but **doesn't clear `server-messages` setting**!

```javascript
// Missing:
await game.settings.set('cyberpunk-agent', 'server-messages', {});
```

**Impact:** Players will re-sync "cleared" messages when they reconnect.

**Fix:** Add server message clearing to `clearAllMessages()`.

---

#### 🟡 MEDIUM: No Selective Message Clearing

**Current:** All-or-nothing approach.

**Missing Features:**
- Clear messages for specific device
- Clear messages older than X days
- Clear specific conversation

**Recommendation:** Add selective clearing options.

---

#### 🟡 MEDIUM: Inconsistent Socket Method Usage

**Location:** module.js:9218-9228

```javascript
// Uses window.socket directly instead of SocketLib
await window.socket.executeForEveryone('allMessagesCleared', {...});
```

Other places use `this.socketLibIntegration`. Should be consistent.

**Fix:** Use SocketLib integration consistently.

---

#### 🟡 MEDIUM: No Progress Feedback for Sync

`synchronizeAllDevices()` shows results after completion but no progress during. For large worlds, this could take time.

**Fix:** Add progress notifications during sync phases.

---

#### 🟢 LOW: Hardcoded Portuguese Text

UI notifications use Portuguese strings:
```javascript
ui.notifications.info("All messages cleared successfully!");  // English
ui.notifications.error("Apenas o GM pode executar...");       // Portuguese
```

**Fix:** Use localization keys consistently.

---

### Integration with Proposed Changes

| Proposed Change | GM Management Impact | Action Needed |
|-----------------|---------------------|---------------|
| UIController update types | None | - |
| State preservation | None | - |
| Chat notifications | None | - |
| GM offline detection | Add "GM Status" indicator | Add to management UI |
| Write queue | Sync operations should use queue | Refactor sync methods |
| Conversation key delimiter | Migration needed on Master Sync | Add migration step |

---

### Recommended Improvements

#### 1. Fix `clearAllMessages()` to Clear Server

```javascript
async clearAllMessages() {
    // ... existing local clearing ...
    
    // CRITICAL: Clear server messages
    await game.settings.set('cyberpunk-agent', 'server-messages', {});
    await game.settings.set('cyberpunk-agent', 'server-read-status', {});
    await game.settings.set('cyberpunk-agent', 'offline-message-queue', {});
    
    // ... notify clients ...
}
```

#### 2. Add Selective Clearing

```javascript
async clearMessagesForDevice(deviceId) {
    // Clear messages for specific device only
}

async clearMessagesOlderThan(days) {
    // Clear messages older than X days
}

async clearConversation(deviceId1, deviceId2) {
    // Clear specific conversation
}
```

#### 3. Add GM Dashboard View

Instead of just action buttons, show:
- Active devices count
- Total messages count
- Unread messages count
- Last sync timestamp
- GM online status indicator

```html
<div class="gm-dashboard-stats">
    <div class="stat-card">
        <span class="stat-value">{{deviceCount}}</span>
        <span class="stat-label">Active Devices</span>
    </div>
    <div class="stat-card">
        <span class="stat-value">{{messageCount}}</span>
        <span class="stat-label">Total Messages</span>
    </div>
    <!-- ... -->
</div>
```

#### 4. Add Confirmation Audit Log

Track destructive actions:
```javascript
async logGMAction(action, details) {
    const log = game.settings.get('cyberpunk-agent', 'gm-audit-log') || [];
    log.push({
        action,
        details,
        userId: game.user.id,
        userName: game.user.name,
        timestamp: Date.now()
    });
    // Keep last 100 entries
    await game.settings.set('cyberpunk-agent', 'gm-audit-log', log.slice(-100));
}
```

---

### Files to Update

| File | Changes |
|------|---------|
| `scripts/module.js` | Fix `clearAllMessages()`, add selective clearing |
| `scripts/gm-zmail-management.js` | Add stats to template data |
| `templates/gm-data-management.html` | Add dashboard stats, selective options |
| `lang/*.json` | Add localization keys for all strings |

