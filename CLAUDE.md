# CLAUDE.md - Cyberpunk Agent Module

> This file provides context for AI assistants working on this codebase.
> Updated: 2026-02-01

## Project Overview

**Cyberpunk Agent** is a FoundryVTT module that provides an in-world phone/messaging system for Cyberpunk RED tabletop RPG sessions. Players communicate through their character's "Agent" devices (in-game smartphones) with a Cyberpunk 2077-inspired UI featuring neon glows, glitch effects, and authentic cyberpunk aesthetics.

### Core Concept
- Each character can equip an "Agent" item (in-game phone)
- Equipped Agents generate unique phone numbers
- Players send messages to other players' Agents
- GMs have universal access to all devices for storytelling

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Platform** | FoundryVTT v12 |
| **Game System** | Cyberpunk RED Core (v0.88.0+) |
| **Language** | Vanilla JavaScript (ES6+) |
| **Templates** | Handlebars (.html) |
| **Styling** | CSS3 with CSS Variables |
| **Real-time Sync** | SocketLib module (v1.1.3+) |
| **Data Storage** | FoundryVTT `game.settings` API |
| **Fonts** | Orbitron, Rajdhani, Share Tech Mono (Google Fonts) |

## Architecture

### Module Structure

```
foundryvtt-cyberpunk-red-agent/
├── scripts/
│   ├── module.js              # Main module (CyberpunkAgent class, ~13k lines)
│   ├── agent-home.js          # AgentApplication UI class
│   └── socketlib-integration.js # Real-time communication handlers
├── templates/                 # Handlebars templates
│   ├── agent-home.html        # Phone home screen
│   ├── chat7.html             # Contacts list view
│   ├── chat-conversation.html # Message conversation view
│   ├── zmail.html             # Email inbox
│   ├── memo.html              # Notes app
│   ├── gm-data-management.html # GM Chat7 data management
│   ├── gm-zmail-management.html # GM ZMail management
│   └── ...
├── styles/
│   └── module.css             # All CSS (~3000 lines, CP2077 theme)
├── lang/
│   ├── en.json                # English translations
│   └── pt-BR.json             # Portuguese (Brazil) translations
├── assets/                    # Images and sounds
├── docs/                      # Technical documentation
└── __tests__/                 # Test scripts (browser console tests)
```

### Core Classes

| Class | File | Purpose |
|-------|------|---------|
| `CyberpunkAgent` | module.js | Main singleton, manages all state and logic |
| `AgentApplication` | agent-home.js | FormApplication for phone UI |
| `ContactSearchModal` | module.js | Modal for adding contacts |
| `GMDataManagementMenu` | module.js | GM settings menu for Chat7 data management |
| `GMZMailManagementMenu` | module.js | GM settings menu for ZMail (compose, manage, history) |
| `WriteQueueManager` | module.js | Serializes GM writes to prevent race conditions |
| `MessageUtils` | module.js | Message ID generation and validation |
| `MessageDeduplicationManager` | module.js | Prevents duplicate messages |
| `MessagePerformanceManager` | module.js | Pagination and batched saves |
| `SmartNotificationManager` | module.js | Notification throttling |
| `ErrorHandlingManager` | module.js | Centralized error handling |
| `UIController` | module.js | UI state management |

### Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GM Client     │    │ Player Client   │    │ Player Client   │
│   (Device A)    │    │   (Device B)    │    │   (Device C)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Foundry VTT Server    │
                    │   (game.settings)       │
                    │  ────────────────────   │
                    │  • server-messages      │
                    │  • device-data          │
                    │  • contact-networks     │
                    │  • zmail-data           │
                    │  • memo-data            │
                    └─────────────────────────┘
```

### FoundryVTT Hooks Used

| Hook | Purpose |
|------|---------|
| `init` | Register settings, initialize module |
| `ready` | Initialize CyberpunkAgent singleton |
| `socketlib.ready` | Initialize SocketLib integration |
| `getSceneControlButtons` | Add phone icon to token controls |
| `renderTokenHUD` | Add Agent button to token right-click menu |
| `canvasReady` | Initialize FAB and refresh controls |
| `renderActorSheet` | Add Agent button to character sheets |
| `updateActor`, `updateItem` | Sync device data on changes |
| `createItem`, `deleteItem` | Handle Agent equipment changes, update FAB visibility |
| `createActor`, `deleteActor` | Handle actor lifecycle |
| `userJoined` | Sync data when players connect |
| `userConnected` | Detect GM online/offline status changes |

### Settings Storage Keys

| Key | Scope | Content |
|-----|-------|---------|
| `device-data` | world | Device registry, phone mappings |
| `phone-number-data` | world | Phone number → device ID mapping |
| `contact-networks` | world | Contact lists per device |
| `server-messages` | world | All chat messages (uses pipe `\|` delimiter for keys) |
| `server-read-status` | world | Read/unread status |
| `deletion-records` | world | Deleted message IDs with 30-day retention |
| `zmail-data` | world | ZMail messages |
| `memo-data` | world | Personal notes |
| `gm-pinned-devices` | world | GM's pinned devices list |
| `offline-message-queue` | world | Messages for offline devices |
| `gm-message-tracking` | world | GM message tracking preference |
| `notification-sound` | client | Enable/disable notification sound (default: ON) |
| `toast-notifications` | client | Enable/disable toast popups (default: OFF) |
| `player-chat-notifications` | client | Enable Foundry chat notifications (default: ON) |
| `enable-token-hud-button` | client | Show Agent button in token right-click menu (default: ON) |
| `enable-fab-button` | client | Show floating Agent button on canvas (default: ON) |
| `enable-token-controls-button` | client | Show Agent in token controls toolbar (default: ON) |
| `fab-position` | client | User's custom FAB position (hidden setting) |

### LocalStorage Keys (Client-side)

| Key | Content |
|-----|---------|
| `cyberpunk-agent-pending-operations` | Queue of operations waiting for GM |
| `cyberpunk-agent-messages-{deviceId}` | Cached messages for device |
| `cyberpunk-agent-cleared-conversations` | Locally cleared conversations |

## Agent Access Methods

Users can access the Agent interface through three methods (each toggle-able in settings):

### 1. Token Controls Toolbar
- Button in the left-side token controls toolbar
- Icon: `fa-mobile-alt`
- Shows only when user has actors with equipped Agents

### 2. Token HUD (Right-Click Menu)
- Button appears in token right-click menu (TokenHUD)
- Position: First button in right column (before Visibility, Target, Combat)
- Shows only for tokens whose actors have equipped Agents
- Players: Only for owned actors
- GM: For any actor with equipped Agent

### 3. Floating Action Button (FAB)
- Persistent draggable button on canvas
- Cyberpunk-styled with cyan glow and pulse animation
- Draggable to any position (position saved per-user)
- Shows only when any accessible actor has equipped Agent
- Click behavior:
  - 1 actor: Opens directly
  - Multiple actors: Shows selection menu
  - GM: Shows all actors with agents

## Apps/Features

### 1. Agent Home (Phone Home Screen)
- Displays character name and phone number
- 3x2 grid of app icons: CHAT7, ZMAIL, MEMO
- Click phone number to copy
- Sync indicator shows when GM is offline (⚠️)

### 2. CHAT7 (Messaging)
- WhatsApp-style contact list with avatars
- Real-time message sync via SocketLib
- Unread message counts with badges
- Contact muting functionality
- Message editing and deletion
- Shift+Enter for multi-line messages
- Auto-scroll to newest messages
- Contacts sorted by last message time

### 3. ZMail (Corporate Email)
- GM-to-player email system
- Unread indicators
- Read/delete functionality
- Corporate/story communication

### 4. Memo (Personal Notes)
- Create/edit/delete personal notes
- 2000 character limit
- Timestamps for creation/modification
- Per-device storage

## Notification System

### Notification Types
The module has three independent notification channels, each configurable per-user:

| Type | Setting | Default | Description |
|------|---------|---------|-------------|
| **Sound** | `notification-sound` | ON | Plays `notification-message.sfx.mp3` |
| **Toast** | `toast-notifications` | OFF | Shows "(Chat7) Nova mensagem de X: preview" |
| **Foundry Chat** | `player-chat-notifications` | ON | Posts styled message to Foundry chat sidebar |

### Notification Flow
```
New Message Received
        │
        ▼
┌───────────────────┐
│ SmartNotification │ ──► Checks: Is conversation active? Is contact muted? Cooldown?
│     Manager       │
└────────┬──────────┘
         │ (if should notify)
         ▼
┌────────────────────────────────────────────────────┐
│ 1. Toast: "(Chat7) Nova mensagem de X: preview"    │
│ 2. Sound: notification-message.sfx.mp3             │
│ 3. Chat: Cyberpunk-styled message (if enabled)     │
│ 4. Unread badge update                             │
└────────────────────────────────────────────────────┘
```

### Smart Suppression
Notifications are **NOT shown** when:
- User has the conversation open (active conversation tracking)
- Contact is muted
- Within 5-second cooldown of previous notification
- Settings disabled for that notification type

### Foundry Chat Notification Style
When enabled, posts a Cyberpunk 2077-themed message to the chat sidebar:
- Yellow accent (#fcee0a), cyan sender (#00f0ff), magenta receiver (#ff2a6d)
- Header: "INCOMING TRANSMISSION"
- Shows route: "FROM → TO"
- Message preview (truncated to 100 chars)

## GM Offline Resilience

### Architecture
The module gracefully handles scenarios when no GM is connected:

```
┌─────────────────────────────────────────────────────────────┐
│                    GM ONLINE                                │
│  ┌──────────┐    SocketLib     ┌──────────┐                │
│  │ Player A ├──────────────────►│   GM    │                │
│  └──────────┘  executeForAll   └────┬─────┘                │
│       ▲                             │                       │
│       │        game.settings.set()  │                       │
│       │        (persistence)        ▼                       │
│       │                      ┌────────────┐                 │
│       └──────────────────────┤   Server   │                 │
│                              └────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GM OFFLINE                               │
│  ┌──────────┐    SocketLib     ┌──────────┐                │
│  │ Player A ├──────────────────►│Player B │ ✅ Real-time   │
│  └──────────┘  executeForAll   └──────────┘    works!      │
│       │                                                     │
│       │ Save to localStorage                                │
│       │ + queue for later                                   │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │ _pendingOps[]   │ ──► Replayed when GM connects          │
│  │ (localStorage)  │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Methods
| Method | Purpose |
|--------|---------|
| `_isGMOnline()` | Check if any GM user is currently connected |
| `_updateGMOnlineStatus()` | Update status and dispatch UI event |
| `_queueOperation(type, payload)` | Queue operation for later sync |
| `_replayPendingOperations()` | Process queue when GM returns |
| `_loadPendingOperations()` | Load queue from localStorage on init |
| `getPendingOperationsCount()` | Get count for UI indicator |

### Operation Queue Types
- `message` - Chat message to save to server
- `contact-add` - Add contact to device
- `contact-remove` - Remove contact from device
- `read-status` - Mark conversation as read

### UI Indicator
When GM is offline, the phone header shows:
- ⚠️ icon with pulsing animation
- Count of pending operations: "(3)"
- Tooltip: "GM Offline - Sync Paused"

## Business Rules

### Device/Agent System
1. **Agent Detection**: Only items of type "gear" with name containing "agent" (case-insensitive) are recognized
2. **Phone Number Generation**: Format `(XXX) XXX-XXXX`, generated on first device registration
3. **Device ID**: UUID generated per Agent item
4. **Actor Ownership**: Each device is linked to its owning actor

### Contact System
1. **Auto-add Contacts**: When receiving a message from unknown device, contact is auto-added
2. **Mutual Contacts**: Adding a contact does NOT auto-add you to their contacts
3. **Contact Storage**: Stored per-device in `contact-networks` setting
4. **Contact Display**: Shows actor name and avatar, sorted by latest message

### Messaging Rules
1. **Message Storage**: All messages stored server-side in `game.settings`
2. **Conversation Key**: Sorted device IDs joined by `|` pipe (e.g., `deviceA|deviceB`)
3. **Legacy Key Migration**: Old `-` delimiter keys auto-migrated on GM startup
4. **Message ID**: Generated with `senderId-receiverId-timestamp-hash-random`
5. **Deduplication**: Recent messages tracked in memory to prevent duplicates
6. **Offline Delivery**: Messages queued for offline devices, delivered on reconnect
7. **Real-time Delivery**: Uses SocketLib `executeForEveryone` (works without GM)
8. **Persistence**: Requires GM to write to `game.settings` (world-scoped)
9. **Write Queue**: GM writes serialized via `WriteQueueManager` to prevent race conditions
10. **Deletion Sync**: Deleted message IDs tracked with 30-day retention for cross-client sync

### GM Privileges
1. **Universal Device Access**: GM can open any character's Agent
2. **Device Pinning**: GM can pin frequently-used devices
3. **Message Moderation**: GM can edit/delete any message
4. **ZMail Sending**: Only GM can send ZMail
5. **Data Management**: GM can clear all messages, contacts, or sync devices
6. **Message Tracking**: GM can see all Agent messages in Foundry chat (optional)

## Development

### Local Setup with Symlink
```bash
# Create symlink (macOS/Linux)
ln -s "/path/to/this/project" "$HOME/Library/Application Support/FoundryVTT/Data/modules/cyberpunk-agent"

# Start Foundry (using Makefile)
make start
```

### Makefile Commands
```bash
make start  # Start FoundryVTT on port 30000
make stop   # Stop FoundryVTT
```

### Testing
Tests are browser console scripts in `__tests__/`. Run in Foundry's browser console:
```javascript
// Example: Run contact test
// Paste content of __tests__/test-contact-search.js in console
```

### Debug Functions (Browser Console)
```javascript
window.CyberpunkAgent.instance                    // Access main instance
window.cyberpunkAgentMasterReset()                // Full reset (GM only)
window.cyberpunkAgentCheckStatus()                // Check module status
window.cyberpunkAgentDebugChat7(deviceId)         // Debug Chat7 issues
window.cyberpunkAgentDebugActorDevices()          // Debug device mapping
window.cyberpunkAgentSyncWithServer()             // Force sync with server
window.quickValidateEnhancements()                // Validate system state
```

## Dependencies

### Required
- **FoundryVTT**: v12
- **SocketLib**: v1.1.3+ (for real-time sync)

### Recommended
- **Cyberpunk RED Core System**: v0.88.0+ (for full integration)

## Common Modification Patterns

### Adding a New App
1. Create template in `templates/new-app.html`
2. Add CSS in `styles/module.css`
3. Add view method in `AgentApplication` class (`agent-home.js`)
4. Add icon to `templates/agent-home.html` grid
5. Add data storage methods in `CyberpunkAgent` class if needed

### Adding a New SocketLib Handler
1. Register handler in `initializeSocketLib()` (`socketlib-integration.js`)
2. Create handler function `handleXxx(data)`
3. Create emission method in `CyberpunkAgent` class

### Adding a New Setting
1. Register in `CyberpunkAgent.registerSettings()` (`module.js`)
2. Add default value handling in initialization
3. Add load/save methods if complex data

## Known Issues & Considerations

### Foundry v12 Compatibility
This module is compatible with FoundryVTT v12. Key v12-specific changes:
- Uses `compatibility` object in module.json (not deprecated `minimumCoreVersion`)
- Uses `CONST.CHAT_MESSAGE_STYLES` (not deprecated `CONST.CHAT_MESSAGE_TYPES`)
- FormApplication patterns verified working in v12

### GM Offline Behavior
When GM disconnects:
- ✅ Real-time messaging works (peer-to-peer via SocketLib)
- ✅ Messages cached locally in localStorage
- ⚠️ Messages queued for server sync when GM returns
- ❌ Cannot sync with server until GM reconnects
- UI shows ⚠️ indicator when GM is offline

### Performance Considerations
- Large message histories: Use pagination (50 messages per page)
- Batched saves: 1-second debounce on message saves
- Message deduplication: 60-second window for duplicate detection
- Notification cooldown: 5-second window between notifications

### File Size Warning
- `module.js` is ~13,000 lines and ~550KB (monolithic architecture)
- Consider refactoring into smaller modules if adding significant features

## Localization

Currently supports:
- English (`en.json`)
- Portuguese Brazil (`pt-BR.json`)

UI strings should use localization keys from `lang/*.json`.

### Key Localization Paths
- `CYBERPUNK_AGENT.SETTINGS.*` - Module settings names/hints
- `CYBERPUNK_AGENT.NOTIFICATIONS.*` - Toast and notification messages
- `CYBERPUNK_AGENT.CHAT7.*` - Chat7 app strings
- `CYBERPUNK_AGENT.DIALOGS.*` - Dialog button labels
- `CYBERPUNK_AGENT.GM_MANAGEMENT.*` - GM Chat7 data management
- `CYBERPUNK_AGENT.ZMAIL.*` - ZMail management and compose

## Coding Conventions

- **Class Names**: PascalCase (e.g., `CyberpunkAgent`)
- **Methods**: camelCase (e.g., `sendDeviceMessage`)
- **Private Methods**: Prefix with `_` (e.g., `_getConversationKey`)
- **CSS Classes**: kebab-case with `cp-` prefix (e.g., `cp-agent-phone`)
- **Template IDs**: kebab-case (e.g., `cyberpunk-agent`)
- **Console Logs**: Prefix with `Cyberpunk Agent |`
- **Events**: Custom events use `cyberpunk-agent-` prefix

## Related Documentation

See `docs/` folder for detailed documentation on specific subsystems:
- `SERVER-BASED-MESSAGING.md` - Message storage architecture
- `SOCKETLIB-MESSAGING.md` - Real-time sync details
- `ACTOR-ISOLATION.md` - Device-actor relationship
- `DEVELOPMENT.md` - Development workflow
- `TROUBLESHOOTING.md` - Common issues and solutions

See `.claude/plans/v12-upgrade-roadmap.md` for the upgrade roadmap and architectural analysis.
