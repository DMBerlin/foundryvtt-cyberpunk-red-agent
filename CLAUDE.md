# CLAUDE.md - Cyberpunk Agent Module

> This file provides context for AI assistants working on this codebase.
> Updated: 2026-01-31

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
| **Platform** | FoundryVTT v10-v12 |
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
│   ├── module.js              # Main module (CyberpunkAgent class, ~12k lines)
│   ├── agent-home.js          # AgentApplication UI class
│   ├── socketlib-integration.js # Real-time communication handlers
│   ├── contact-search.js      # Contact search modal
│   └── gm-zmail-management.js # GM ZMail management UI
├── templates/                 # Handlebars templates
│   ├── agent-home.html        # Phone home screen
│   ├── chat7.html             # Contacts list view
│   ├── chat-conversation.html # Message conversation view
│   ├── zmail.html             # Email inbox
│   ├── memo.html              # Notes app
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
| `ContactSearchModal` | contact-search.js | Modal for adding contacts |
| `GMZMailManagementApplication` | gm-zmail-management.js | GM-only ZMail management |
| `GMDataManagementMenu` | module.js | GM settings menu for data management |
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
| `renderActorSheet` | Add Agent button to character sheets |
| `updateActor`, `updateItem` | Sync device data on changes |
| `createItem`, `deleteItem` | Handle Agent equipment changes |
| `createActor`, `deleteActor` | Handle actor lifecycle |
| `userJoined` | Sync data when players connect |

### Settings Storage Keys

| Key | Scope | Content |
|-----|-------|---------|
| `device-data` | world | Device registry, phone mappings |
| `phone-number-data` | world | Phone number → device ID mapping |
| `contact-networks` | world | Contact lists per device |
| `server-messages` | world | All chat messages |
| `server-read-status` | world | Read/unread status |
| `zmail-data` | world | ZMail messages |
| `memo-data` | world | Personal notes |
| `gm-pinned-devices` | world | GM's pinned devices list |
| `offline-message-queue` | world | Messages for offline devices |
| `gm-message-tracking` | world | GM message tracking preference |

## Apps/Features

### 1. Agent Home (Phone Home Screen)
- Displays character name and phone number
- 3x2 grid of app icons: CHAT7, ZMAIL, MEMO
- Click phone number to copy

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
2. **Conversation Key**: Sorted device IDs joined by `|` (e.g., `deviceA|deviceB`)
3. **Message ID**: Generated with `senderId-receiverId-timestamp-hash-random`
4. **Deduplication**: Recent messages tracked in memory to prevent duplicates
5. **Offline Delivery**: Messages queued for offline devices, delivered on reconnect

### GM Privileges
1. **Universal Device Access**: GM can open any character's Agent
2. **Device Pinning**: GM can pin frequently-used devices
3. **Message Moderation**: GM can edit/delete any message
4. **ZMail Sending**: Only GM can send ZMail
5. **Data Management**: GM can clear all messages, contacts, or sync devices

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
- **FoundryVTT**: v10-v12
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

### Foundry v12 Upgrade Notes
- Deprecated: `minimumCoreVersion` and `compatibleCoreVersion` (use `compatibility` object)
- Check for deprecated Application API changes
- Verify FormApplication patterns still work

### Performance Considerations
- Large message histories: Use pagination (50 messages per page)
- Batched saves: 1-second debounce on message saves
- Message deduplication: 60-second window for duplicate detection

### File Size Warning
- `module.js` is ~12,000 lines and ~500KB (monolithic architecture)
- Consider refactoring into smaller modules if adding significant features

## Localization

Currently supports:
- English (`en.json`)
- Portuguese Brazil (`pt-BR.json`)

UI strings should use localization keys from `lang/*.json`.

## Coding Conventions

- **Class Names**: PascalCase (e.g., `CyberpunkAgent`)
- **Methods**: camelCase (e.g., `sendDeviceMessage`)
- **Private Methods**: Prefix with `_` (e.g., `_getConversationKey`)
- **CSS Classes**: kebab-case with `cp-` prefix (e.g., `cp-agent-phone`)
- **Template IDs**: kebab-case (e.g., `cyberpunk-agent`)
- **Console Logs**: Prefix with `Cyberpunk Agent |`

## Related Documentation

See `docs/` folder for detailed documentation on specific subsystems:
- `SERVER-BASED-MESSAGING.md` - Message storage architecture
- `SOCKETLIB-MESSAGING.md` - Real-time sync details
- `ACTOR-ISOLATION.md` - Device-actor relationship
- `DEVELOPMENT.md` - Development workflow
- `TROUBLESHOOTING.md` - Common issues and solutions
