# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.1.1] - 2025-09-13

## [2.1.0] - 2025-09-13

### Added
- **Multi-line Message Support**: Enhanced messaging system with line break functionality
  - **Shift+Enter Support**: Press Shift+Enter to add line breaks without sending message
  - **Auto-resizing Input**: Textarea automatically expands (1-5 lines) with smooth animations
  - **Line Break Preservation**: Line breaks preserved in storage, transmission, and display
  - **Visual Hint**: Protocol text includes "SHIFT+ENTER: LINE BREAK" instruction
  - **Enhanced CSS**: Added `white-space: pre-wrap` for proper line break rendering

- **Message Editing System**: Comprehensive message editing with cyberpunk-styled interface
  - **Context Menu Integration**: Added "Editar Mensagem" option to message context menus
  - **Permission System**: Players can edit own messages, GMs can edit any message
  - **Cyberpunk Modal**: Phone-native editing modal with authentic CP2077 styling
  - **Advanced Editor**: Auto-resizing textarea with character counter and keyboard shortcuts
  - **Real-time Sync**: Edits propagate to server storage and all connected clients
  - **Edit Indicators**: Messages show "(editada)" label when modified
  - **Audit Trail**: Original text preserved for transparency
  - **Keyboard Shortcuts**: Ctrl+Enter to save, Shift+Enter for line breaks, Escape to cancel

- **Enhanced Message Deletion**: Complete deletion propagation system
  - **Server Persistence**: Player deletions now affect server storage and all clients
  - **GM Message Broker**: Enhanced GM processing of player deletion requests
  - **Real-time Broadcast**: All connected players see deletions immediately
  - **Error Handling**: Clear notifications when GM offline or SocketLib unavailable
  - **Consistency**: Same deletion behavior for GM and players across all storage layers

- **Master Device & Message Synchronization**: Enhanced sync system with actor data updates
  - **Actor Data Sync**: Updates device names and avatars from character sheets during sync
  - **Complete Message Sync**: Clears all players' local storage and syncs from GM server storage
  - **Three-Phase Process**: Actor data → Device registry → Message synchronization
  - **Enhanced Notifications**: Comprehensive sync results with detailed statistics
  - **Authoritative Source**: GM world settings become single source of truth
  - **Standalone Actor Sync**: Option to sync only actor data without full message sync

### Enhanced
- **Message Balloon Readability**: Added minimum width (120px) for better short message display
  - **Short Messages**: "ok", "yes", etc. now have readable balloons with visible timestamps
  - **Edit Labels**: "(editada)" indicators never get cut off
  - **Consistent Proportions**: All messages maintain proper visual balance

- **Phone-Native Modal Experience**: Edit modal contained within agent interface
  - **Authentic Feel**: Modal appears within phone screen, not as game overlay
  - **Optimized Dimensions**: 85% width (max 350px) for phone-friendly experience
  - **Compact Design**: Reduced padding and font sizes for mobile feel
  - **Better Integration**: Feels like native phone app feature

### Technical Improvements
- **Server Storage Architecture**: Enhanced message persistence across sessions
  - **Hybrid Storage**: Server storage (authoritative) + localStorage (cache)
  - **Cross-session Persistence**: Deleted/edited messages stay changed after reconnect
  - **GM Authority**: Server-side operations ensure data consistency
  - **Error Resilience**: Graceful handling of offline scenarios

- **SocketLib Integration**: New handlers for editing and enhanced deletion
  - **Message Edit Handlers**: `editMessageOnServer`, `messageEditedOnServer`
  - **Enhanced Deletion**: Improved broadcast system with confirmation
  - **Real-time Updates**: All operations synchronized across clients
  - **Backward Compatibility**: Legacy handlers maintained

### Fixed
- **Message Deletion Persistence**: Deleted messages no longer reappear when players reconnect
- **Actor Data Synchronization**: Device names and avatars stay current with character sheets
- **Modal Positioning**: Edit modal properly contained within agent interface
- **Message Display**: Short messages now properly display time and edit indicators

## [2.0.9] - 2025-09-11

## [2.0.8] - 2025-09-11

## [2.0.7] - 2025-09-11

## [2.0.6] - 2025-09-10

## [2.0.5] - 2025-09-10

## [2.0.4] - 2025-09-10

## [2.0.3] - 2025-09-10

## [2.0.2] - 2025-09-10

## [2.0.1] - 2025-09-10

### Added
- **Device Management Settings**: Comprehensive device management system in Game Settings for GMs:
  - **GM Data Management Menu**: New settings menu accessible only to GMs with device registry management tools
  - **Clear All Messages**: Delete all chat message histories for all devices in the registry
  - **Clear All Contact Lists**: Clear contact lists from all agent devices while keeping devices intact
  - **Synchronize All Devices**: Ensure all devices in the registry have phone numbers attached
  - **Confirmation Dialogs**: All destructive actions require confirmation with clear warnings
  - **Cross-Client Synchronization**: All operations synchronized across all connected clients via SocketLib
  - **Real-time Updates**: Changes immediately reflected across all client interfaces
  - **Permission Enforcement**: Only GMs can access and use these management tools
- **Enhanced Settings Registration**: Added new internal settings for comprehensive data management:
  - **Contact Networks Setting**: Internal storage for contact network data
  - **Improved Device Data Management**: Enhanced device data storage and management
  - **Phone Number Registry**: Comprehensive phone number mapping system
- **SocketLib Integration for Device Management**: New broadcast types and handlers:
  - **allContactListsCleared**: Broadcast when contact lists are cleared
  - **allDevicesSynchronized**: Broadcast when devices are synchronized
  - **Cross-client Notifications**: Real-time notifications for all management operations
  - **Fallback Handling**: Graceful degradation when SocketLib is unavailable
- **Context Menu Ownership Restriction with GM Access**: Implemented security feature to restrict context menu access based on message ownership and user role
  - Regular players can only access context menu on messages they sent (own messages)
  - Game Masters can access context menu on all messages for administrative control
  - Prevents accidental or unauthorized deletion of other users' messages by regular players
  - Visual feedback shows which messages are interactive (own messages for players, all messages for GMs)
  - Warning notification when regular players try to access context menu on other users' messages
  - Subtle menu indicator (⋮) appears on hover for interactive messages
- **Device-Specific Chat History Management**: Implemented device-specific chat history storage and management
  - Each device now manages its own chat history independently
  - Messages deleted on one device do not affect other devices
  - Device-specific clear history functionality
- **Individual Message Deletion**: Added context menu for individual message balloons
  - Right-click on own messages to access context menu
  - Delete individual messages (device-specific)
  - Copy message text to clipboard
  - View message information (ID, text, time, device)
- **Enhanced Context Menu System**: 
  - Message-specific context menu with delete, copy, and info options (own messages only)
  - Contact context menu now clears history device-specifically
  - Visual feedback for hover states and interactions
- **SocketLib Integration for Message Deletion**: 
  - Real-time synchronization of message deletions across clients
  - Device-specific message deletion notifications
  - Cross-client message deletion handling
- **New Methods and Functions**:
  - `deleteDeviceMessages(deviceId, contactDeviceId, messageIds)` - Delete specific messages for a device
  - `handleDeviceMessageDeletion(data)` - Handle device message deletion notifications
  - `_notifyDeviceMessageDeletion(deviceId, contactDeviceId, messageIds)` - Notify clients of device message deletion
  - `_showMessageContextMenu(event, messageId, messageText, messageTime)` - Show message context menu
  - `_deleteMessage(messageId)` - Delete a specific message
  - `_copyMessageText(messageText)` - Copy message text to clipboard
  - `_showMessageInfo(messageId, messageText, messageTime)` - Show message information dialog
- **Enhanced UI and Styling**:
  - Message balloons now have hover effects and context menu indicators (own messages only)
  - Improved visual feedback for interactive elements
  - Context menu positioning and styling enhancements
  - Different cursor styles for own vs other messages
- **Testing and Debugging**:
  - Comprehensive test script for context menu ownership restriction
  - Test script for device message deletion functionality
  - Manual testing instructions and verification steps
  - Console-based testing functions for all new features

### Technical Details
- **Device Management System**: Comprehensive GM-only settings interface for device registry management:
  - **GMDataManagementMenu Class**: Custom FormApplication for device management interface
  - **Settings Registration**: New internal settings for contact networks and enhanced device data
  - **Permission Validation**: All operations verify GM permissions before execution
  - **Data Persistence**: Changes saved to FoundryVTT settings and synchronized across clients
- **SocketLib Broadcast System**: New broadcast types for device management operations:
  - **handleAllContactListsCleared()**: Handles contact list clearing notifications
  - **handleAllDevicesSynchronized()**: Handles device synchronization notifications
  - **Cross-client Updates**: Real-time synchronization of all management operations
- **Message Ownership Security**: Context menu access restricted to message owners based on `senderId` field, with GM override for administrative control
- **Device-Specific Storage**: Messages are now stored and managed per device
- **Context Menu Integration**: Added right-click context menu functionality to message balloons (own messages for players, all messages for GMs)
- **SocketLib Handlers**: New handlers for device message deletion synchronization
- **UI Controller Updates**: Enhanced UI update system for message deletions
- **Template Enhancements**: Added data attributes to message elements for context menu functionality
- **CSS Styling**: Added hover effects and visual feedback for message interactions (own messages for players, all messages for GMs)
- **Ownership Detection**: Messages marked as "own" or "other" based on sender device ID

### Files Modified
- `scripts/module.js`: Added device management methods, GMDataManagementMenu class, and enhanced settings registration
- `templates/gm-data-management.html`: Updated with new device management buttons and improved descriptions
- `scripts/socketlib-integration.js`: Added new broadcast handlers for device management operations
- `lang/en.json`: Added device management settings labels and descriptions
- `lang/pt-BR.json`: Added Portuguese translations for device management settings
- `docs/DEVICE-MANAGEMENT-SETTINGS.md`: New comprehensive documentation for device management features
- `scripts/module.js`: Added device message deletion methods and handlers
- `scripts/agent-home.js`: Added message context menu functionality and handlers with ownership restriction
- `scripts/socketlib-integration.js`: Added device message deletion SocketLib handlers
- `templates/chat-conversation.html`: Added data attributes for message context menu
- `styles/module.css`: Added styling for message context menu and hover effects (own messages only)
- `scripts/test-device-message-deletion.js`: New comprehensive test script

### Fixed
- **SocketLib Broadcast Issue**: Fixed "Clear All Messages" not broadcasting to other clients due to incorrect socket access pattern
- **TypeError in clearAllMessages**: Resolved `TypeError: Cannot read properties of undefined (reading 'executeAsGM')` by using correct `window.socket` access instead of `this.socketLibIntegration.socket`
- **Cross-client Synchronization**: All GM data management operations now properly broadcast to all connected clients
- **Broadcast Method Fix**: Changed from `executeAsGM('broadcastUpdate')` to `executeForEveryone()` for proper cross-client broadcasting
- **Handler Registration**: Added direct handler registration for `allMessagesCleared`, `allContactListsCleared`, and `allDevicesSynchronized` events
- `__tests__/test-context-menu-ownership.js`: New test script for context menu ownership restriction
- `docs/CONTEXT-MENU-OWNERSHIP.md`: New documentation for context menu ownership feature
- `CHANGELOG.md`: Added unreleased section with new features

## [2.1.0] - 2025-01-30

### Added
- **GM Agent Interface Improvements**: Significantly improved the phone icon on token controls for GM functionality:
  - **Ownership-Based Filtering**: GM now sees only equipped Agents from characters they own
  - **No More "(Unknown)" Labels**: All devices show proper character names instead of confusing labels
  - **Consistent Logic**: Same behavior for GM and players - based on equipment status
  - **Automatic vs Manual Selection**: Single Agent opens directly, multiple Agents show selection menu
  - **Clean Interface**: Removed irrelevant devices and confusing labels
- **Phone Number Assignment Timing**: Enhanced phone number management for better user experience:
  - **Immediate Assignment**: Phone numbers are assigned immediately when agent items are added to actor gear
  - **Automatic Cleanup**: Phone numbers are automatically removed when agent items are deleted from actor gear
  - **Equipment Status Monitoring**: Enhanced hooks to monitor equipment status changes
  - **Proactive Management**: Phone numbers are ensured when items are equipped
  - **Agent Sync Functions**: New synchronization tools for ensuring all equipped agents are properly registered:
    - **Comprehensive Scanning**: Scans all actors and their equipped agent items
    - **Automatic Registration**: Creates devices and assigns phone numbers for missing agents
    - **Detailed Reporting**: Provides comprehensive logs of the sync process
    - **Quick Sync Option**: Fast verification mode for checking missing registrations
    - **Console Integration**: Available via `window.cyberpunkAgent.syncAllAgents()` and `window.cyberpunkAgent.quickSyncAgents()`

### Fixed
- **GM Token Controls**: Fixed GM phone icon showing all devices with "(Unknown)" labels:
  - **Device Filtering**: Now properly filters by ownership and equipment status
  - **Label Accuracy**: All devices show correct character names
  - **Access Control**: GM only sees devices from characters they own
  - **User Experience**: Much cleaner and more intuitive interface

### Technical Details
- **Unified Logic**: Removed GM-specific device filtering in favor of consistent `getEquippedAgentsForUser()` logic
- **Simplified Functions**: Streamlined `addControlButton()` and `openAgentInterface()` functions
- **Ownership Respect**: Properly respects FoundryVTT character ownership system
- **Backward Compatible**: No breaking changes, existing functionality preserved
- **Test Suite**: Added `test-gm-agent-improvements.js` for comprehensive testing
- **Documentation**: Created `GM-AGENT-IMPROVEMENTS.md` with detailed explanations

### Benefits
- **Professional Interface**: No more confusing "(Unknown)" labels
- **Intuitive Access**: GM sees only relevant, equipped devices
- **Consistent Behavior**: Same logic for GM and players
- **Reduced Confusion**: Clear, predictable interface
- **Better Security**: Respects character ownership permissions

### Files Modified
- `scripts/module.js`: Updated `addControlButton()`, `openAgentInterface()`, `checkAndCreateDevicesForActor()`, `setupItemUpdateHooks()` functions, and added `syncAllAgents()` and `quickSyncAgents()` methods
- `scripts/test-gm-agent-improvements.js`: New comprehensive test script
- `scripts/test-phone-assignment-timing.js`: New test script for phone number assignment timing
- `docs/GM-AGENT-IMPROVEMENTS.md`: New documentation file
- `README.md`: Updated GM usage instructions, phone number management details, and sync function documentation
- `CHANGELOG.md`: Added version 2.1.0 entry
- `package.json`: Removed `sync` npm script (functionality moved to console)

## [1.0.55] - 2025-01-30

### Added
- **Realtime Unread Count Improvements**: Enhanced the real-time unread count system for better user experience:
  - **Immediate Updates**: Unread counts now update immediately when new messages arrive
  - **Automatic Mark as Read**: Messages are automatically marked as read when conversation is opened
  - **Cache Management**: Implemented forced cache clearing to ensure accurate count calculations
  - **Multiple Update Strategies**: Added multiple strategies for UI updates to ensure reliability
  - **Legacy Support**: Added support for legacy Chat7Application windows

### Fixed
- **Unread Count Accuracy**: Fixed issues where unread counts were not updating correctly:
  - **Cache Issues**: Implemented forced cache clearing before calculating unread counts
  - **UI Update Reliability**: Added multiple strategies for forcing UI updates
  - **Mark as Read Timing**: Improved timing of when messages are marked as read
  - **Cross-Client Synchronization**: Enhanced real-time updates across multiple clients
- **Message Display Regression**: Fixed critical regression where messages were not displaying in chat conversations:
  - **Template Property Mapping**: Fixed missing `text` property mapping for message display
  - **Race Conditions**: Resolved race conditions caused by multiple mark-as-read calls
  - **UI Update Conflicts**: Reduced excessive UI update strategies that were causing conflicts
- **Message Content Missing**: Fixed issue where message text was not appearing inside chat bubbles:
  - **Property Mismatch**: Fixed mismatch between message storage (`text` property) and template access (`message` property)
  - **Data Flow**: Ensured consistent property usage from message creation to template rendering
  - **Compatibility**: Added fallback to `message.message` for backward compatibility
- **Chat Header Corruption**: Fixed corrupted chat header (avatar and contact name) display:
  - **Contact Data Flow**: Ensured proper contact data assignment to template
  - **Rendering Guards**: Removed guards that were preventing proper conversation rendering

### Technical Details
- **Enhanced Functions**: Improved `handleMessageUpdate()`, `_forceChat7UnreadCountUpdate()`, `markConversationAsRead()`
- **UI Controller Integration**: Better integration with the UI Controller system for real-time updates
- **Event Handling**: Improved event handling for immediate UI updates
- **Template Fixes**: Added explicit `message` → `text` property mapping for template compatibility
- **Property Access Fix**: Fixed `getData()` method to use `message.text` with fallback to `message.message` for compatibility
- **Race Condition Resolution**: Removed duplicate `markConversationAsRead` calls to prevent conflicts
- **UI Strategy Optimization**: Reduced from 5 to 3 UI update strategies to prevent conflicts
- **Test Suite**: Added comprehensive test scripts `test-realtime-unread-count-fix.js`, `test-message-display-fix.js`, and `test-message-content-fix-verification.js`
- **Documentation**: Created detailed documentation in `REALTIME-UNREAD-COUNT-FIX.md`, `MESSAGE-DISPLAY-FIX.md`, and `MESSAGE-CONTENT-FIX.md`

### Benefits
- **Better User Experience**: Users see unread counts update immediately
- **Automatic Cleanup**: Messages are marked as read automatically when conversations are opened
- **Reliable Updates**: Multiple update strategies ensure UI updates happen reliably
- **Cross-Client Consistency**: All clients see the same unread count status
- **Restored Functionality**: Messages and chat headers now display correctly
- **Message Content Display**: Message text now appears correctly inside chat bubbles
- **Reduced Conflicts**: Fewer UI update strategies reduce rendering conflicts

### Files Modified
- `scripts/module.js`: Enhanced message update handling and unread count management
- `scripts/agent-home.js`: Improved conversation opening, mark as read functionality, and message property access
- `__tests__/test-realtime-unread-count-fix.js`: New comprehensive test script
- `__tests__/test-message-display-fix.js`: New test script for message display fixes
- `__tests__/test-message-content-fix-verification.js`: New test script for message content verification
- `docs/REALTIME-UNREAD-COUNT-FIX.md`: New documentation file
- `docs/MESSAGE-DISPLAY-FIX.md`: New documentation file for message display fixes
- `docs/MESSAGE-CONTENT-FIX.md`: New documentation file for message content fix
- `TODO.md`: Updated to reflect completed improvements

## [1.0.54] - 2025-01-30

### Added
- **Message Synchronization System**: Implemented automatic message synchronization when opening agents:
  - **Automatic Sync**: When an agent is opened, it automatically synchronizes with other clients to receive new messages
  - **Cross-Client Communication**: Uses SocketLib to request messages from all other active users
  - **Duplicate Prevention**: Implements checks to avoid adding duplicate messages during synchronization
  - **Real-time Updates**: Messages sent while agents are closed are automatically received when agents are opened

### Fixed
- **Message Persistence Issue**: Fixed messages not appearing in chat when agent is closed during reception:
  - **Root Cause**: SocketLib handlers were using `saveMessages()` instead of `saveMessagesForActor()`
  - **Solution**: Corrected handlers to save messages to actor-specific localStorage locations
  - **Impact**: Messages now persist correctly and appear in chat when agent is reopened
  - **Technical Details**: Fixed `handleSendMessage()` and `handleMessageUpdate()` in SocketLib integration

### Technical Details
- **New Functions**: Added `synchronizeMessagesWithServer()`, `handleMessageSyncRequest()`, `handleMessageSyncResponse()`
- **SocketLib Integration**: Registered new handlers `requestMessageSync` and `messageSyncResponse`
- **Message Filtering**: Only synchronizes messages from the last 24 hours to prevent excessive data transfer
- **Access Control**: Validates user access to actors before sharing messages
- **Test Suite**: Added comprehensive test scripts `test-message-sync.js` and `test-message-persistence-fix.js`
- **Documentation**: Created `MESSAGE-SYNC.md` and `MESSAGE-PERSISTENCE-FIX.md` with detailed explanations

### Benefits
- **No Message Loss**: Messages sent while agents are closed are automatically received when opened
- **Transparent Operation**: Synchronization happens automatically without user intervention
- **Performance Optimized**: Only synchronizes when agents are opened, not continuously
- **Robust Communication**: Uses SocketLib for reliable cross-client communication
- **Reliable Persistence**: Messages are saved to the correct storage location for each actor

### Files Modified
- `scripts/module.js`: Added message synchronization functions and integrated with `showAgentHome()`
- `scripts/socketlib-integration.js`: Added new SocketLib handlers and fixed message persistence
- `__tests__/test-message-sync.js`: New comprehensive test script for synchronization
- `__tests__/test-message-persistence-fix.js`: New test script for persistence fix verification
- `docs/MESSAGE-SYNC.md`: New documentation file for synchronization system
- `docs/MESSAGE-PERSISTENCE-FIX.md`: New documentation file for persistence fix

## [1.0.53] - 2025-01-30

### Fixed
- **Interface Auto-Open Issue**: Fixed critical bug where the Agent interface would open automatically after clearing data in module settings:
  - **Root Cause**: Event listeners were not being properly removed when interfaces were closed, causing them to react to update events
  - **Solution**: Implemented proper event listener cleanup and visibility checks before processing updates
  - **Impact**: Agent interface no longer opens unexpectedly after data clearing operations

### Technical Details
- **Event Listener Cleanup**: Added proper removal of `cyberpunk-agent-update` event listeners in `close()` method
- **Visibility Checks**: Added checks to ensure interfaces are rendered and visible before processing updates
- **Selective Updates**: Modified update functions to only process visible interfaces
- **Memory Leak Prevention**: Proper cleanup prevents memory leaks from orphaned event listeners
- **Test Suite**: Added comprehensive test script to verify the fix works correctly

### Files Modified
- `scripts/agent-home.js`: Added event listener cleanup and visibility checks
- `scripts/module.js`: Modified update functions to be more selective
- `__tests__/test-interface-auto-open-fix.js`: New test script for verification
- `docs/INTERFACE-AUTO-OPEN-FIX.md`: Documentation of the fix

## [1.0.52] - 2025-01-30

### Added
- **Actor Isolation System**: Implemented complete isolation of mute settings and message history per actor:
  - **Mute Settings Isolation**: Each actor now has independent mute configurations for their contacts
  - **Message History Isolation**: Each actor maintains their own conversation history, independent of other actors
  - **Migration System**: Automatic detection and migration of existing data to the new isolated format
  - **Backup System**: Automatic backup of old data before migration with rollback capability

### Changed
- **Mute System**: Changed mute key format from `actorId-contactId` to `userId-actorId-contactId` for complete isolation
- **Message Storage**: Changed from global storage to actor-specific storage (`cyberpunk-agent-messages-userId-actorId`)
- **Agent Loading**: Modified `showAgentHome()` to load actor-specific messages when opening an agent
- **Message Saving**: Updated `sendMessage()` and `handleMessageUpdate()` to save messages for both sender and receiver actors

### Technical Details
- **New Methods**: Added `saveMessagesForActor()`, `loadMessagesForActor()` for actor-specific message management
- **Migration Scripts**: Created `migrate-actor-isolation.js` with automatic migration detection and rollback functionality
- **Test Suite**: Added `test-actor-isolation.js` with comprehensive tests for mute and message isolation
- **Documentation**: Created `ACTOR-ISOLATION.md` with detailed explanation of the isolation system
- **Backward Compatibility**: Maintained compatibility with existing data through automatic migration

### Benefits
- **GM Flexibility**: GM can have different mute settings for each character they control
- **Player Privacy**: Players' mute settings and message history are completely isolated
- **Performance**: Only loads relevant data for the current actor
- **Data Integrity**: Prevents cross-contamination of settings between different actors

## [1.0.51] - 2025-01-30
### Fixed
- **Contact Display Issue**: Fixed a critical bug where contacts were not appearing in the character's agent UI after being added via the Contact Manager. The issue was caused by a data structure mismatch in the `getContactsForActor` method, which was expecting contact IDs but receiving contact objects. Contacts are now properly displayed immediately after addition.

## [1.0.50] - 2025-01-30

### Fixed
- **SocketLib Connection Warnings**: Removed unreliable `socketlib.isConnected()` checks that were causing false "not connected" warnings:
  - **Root Cause**: SocketLib doesn't have a persistent connection state like traditional WebSockets, making `isConnected()` checks misleading
  - **Solution**: Replaced connection state checks with availability checks for `socketlib` and `window.socket` objects
  - **Impact**: Eliminated false "SocketLib not connected" warnings when adding contacts and other operations

### Technical Details
- **Removed Connection Checks**: Eliminated all `socketlib.isConnected()` calls throughout the codebase
- **Updated Availability Logic**: Changed from connection-based to availability-based SocketLib checks
- **Improved Error Logging**: Removed misleading connection status from error logs
- **Enhanced Debug Methods**: Updated debug and test methods to reflect proper SocketLib usage patterns
- **Contact Update Fix**: Fixed "SocketLib not connected, cannot send update" warnings during contact addition

## [1.0.49] - 2025-01-30

### Fixed
- **GM Data Management Dialog Error**: Fixed "yes is not a function" and "no is not a function" errors in GM Data Management dialogs:
  - **Root Cause**: `Dialog.confirm()` was being used incorrectly with string values for `yes` and `no` properties
  - **Solution**: Replaced `Dialog.confirm()` with proper `Dialog` constructor using `buttons` object with callback functions
  - **Impact**: GM Data Management confirmation dialogs now work correctly without throwing errors

### Technical Details
- **Dialog Implementation**: Updated both `_onClearAllMessages()` and `_onClearAllContacts()` methods to use proper Dialog constructor
- **Promise-based Resolution**: Used Promise-based approach to handle dialog confirmation asynchronously
- **Proper Button Callbacks**: Implemented proper button callbacks that resolve the Promise with boolean values
- **Default Button**: Set "no" as the default button for safety

## [1.0.48] - 2025-01-30

### Fixed
- **GM Data Management Template Path**: Fixed ENOENT error when opening GM Data Management menu:
  - **Root Cause**: Template path was using relative path `templates/gm-data-management.html` instead of full module path
  - **Solution**: Changed template path to `modules/cyberpunk-agent/templates/gm-data-management.html` to match other templates
  - **Impact**: GM Data Management menu now opens correctly without file not found errors

### Technical Details
- **Template Path Correction**: Updated `GMDataManagementMenu.defaultOptions.template` to use full module path
- **Consistency**: Aligned with other template paths in the module (e.g., `modules/cyberpunk-agent/templates/...`)
- **Foundry VTT Compatibility**: Ensures Foundry VTT can properly locate and load the template file

## [1.0.47] - 2025-01-30

### Added
- **GM Data Management Tools**: Added comprehensive GM data management functionality to module settings:
  - **Clear All Messages Button**: Allows GM to delete all chat message histories for all actors
  - **Clear All Contacts Button**: Allows GM to delete all contact connections for all actors (also deletes all messages)
  - **GM Data Management Menu**: New settings menu accessible only to GMs with warning dialogs and confirmation prompts
  - **Cross-Client Synchronization**: All clearing operations are synchronized across all connected clients via SocketLib

### Fixed
- **Contact Addition Error**: Fixed "Erro ao adicionar contato!" error when adding contacts that already exist:
  - **Root Cause**: `addContactToActor` was returning `false` when contact already existed, causing error message
  - **Solution**: Changed logic to return `true` when contact already exists, treating it as a successful operation
  - **Impact**: Contact addition now works properly without showing errors for existing contacts

### Technical Details
- **New Methods**: Added `clearAllMessages()` and `clearAllContacts()` methods to CyberpunkAgent class
- **SocketLib Integration**: Added handlers for `allMessagesCleared` and `allContactsCleared` broadcast types
- **localStorage Management**: Comprehensive clearing of all localStorage items across all users
- **UI Updates**: Automatic interface updates after clearing operations
- **Permission Enforcement**: All operations restricted to GM users only
- **Warning System**: Confirmation dialogs with clear warnings about irreversible actions

## [1.0.46] - 2025-01-30

### Fixed
- **Contact Manager Error**: Fixed "Erro ao adicionar contato!" error when adding contacts via Contact Manager:
  - **Root Cause**: Missing permission checks and inadequate error handling in contact addition process
  - **Solution**: Added comprehensive permission checks and error handling throughout the contact addition flow
  - **Impact**: Contact addition now works properly with clear error messages and proper GM permission enforcement

### Technical Details
- **Permission Enforcement**: Added GM-only restriction for `addContactToActor` method since `contact-networks` is world-scoped
- **Enhanced Error Handling**: Improved error handling in `addContactToActor`, `saveContactNetworks`, and `_onResultClick` methods
- **Better User Feedback**: Enhanced error messages to indicate GM permission requirements and provide specific error details
- **Validation Checks**: Added validation for CyberpunkAgent instance availability and method existence before operations
- **Setting Verification**: Added verification that `contact-networks` setting is properly registered before attempting to save

## [1.0.45] - 2024-12-29

### Removed
- **Anonymous Contact Feature**: Completely removed all anonymous contact functionality from the module:
  - **Root Cause**: Anonymous contact feature was causing bugs and complexity in the agent system
  - **Solution**: Removed all anonymous contact related code, methods, and UI elements
  - **Impact**: Simplified contact system, reduced complexity, and eliminated related bugs

### Technical Details
- **Removed Methods**: `getAnonymousContact`, `_getExistingAnonymousContact`, `_storeAnonymousContact`, `getAnonymousContactsForActor`, `_convertAnonymousToRegularContact`
- **Removed UI Elements**: Anonymous contact display logic from Chat7 template and CSS styles
- **Removed Tests**: All test functions and files related to anonymous contacts
- **Simplified Data Structure**: Removed anonymous contact storage and management from agent data
- **Updated Contact Logic**: Simplified `getContactsForActor` to only return regular contacts
- **Cleaned Up References**: Removed all anonymous contact references from UI and data processing

## [1.0.44] - 2024-12-29

### Fixed
- **Real-time Unread Count Updates**: Fixed issue where unread message count chips were not updating immediately when new messages arrived while the Chat7 contact list was open:
  - **Root Cause**: Chat7 interfaces were not being forced to refresh their unread count data when new messages arrived
  - **Solution**: Implemented `_forceChat7UnreadCountUpdate()` method to specifically target Chat7 interfaces for unread count updates
  - **Impact**: Unread count chips now appear instantly when a new message is received, without requiring navigation away from the contact list screen

### Added
- **Enhanced Message Update Processing**: Improved real-time message update handling:
  - **Chat7-Specific Updates**: New `_forceChat7UnreadCountUpdate()` method targets Chat7 interfaces specifically
  - **Multiple Update Strategies**: Comprehensive update strategies including UI Controller, direct targeting, and forced re-rendering
  - **Real-time Event Handling**: Enhanced real-time event handling for `messageUpdate` events
  - **Unread Count Cache Management**: Improved cache clearing to ensure fresh data retrieval

### Changed
- **Message Update Flow**: Enhanced message update processing:
  - Updated `handleMessageUpdate()` to include Chat7-specific unread count updates
  - Enhanced Chat7 real-time listener to force re-renders for message updates
  - Improved UI Controller update handling for Chat7 components
  - Added comprehensive logging for debugging unread count updates

## [1.0.43] - 2024-12-29

### Fixed
- **Fixed Contact Mute UI Update Issue**: Resolved problem where contact mute status wasn't updating immediately in the UI:
  - **Root Cause**: `_toggleContactMute` was calling `_renderChat7View()` which only set up listeners, not forcing re-render
  - **Solution**: Implemented comprehensive UI update strategy with multiple fallback mechanisms
  - **Impact**: Contact mute status now updates immediately without requiring screen navigation

### Added
- **Enhanced Contact Mute UI Updates**: Improved real-time UI updates for contact mute operations:
  - **Multiple Update Strategies**: UI Controller marking, force re-render, and custom events
  - **Immediate Visual Feedback**: Mute status changes are reflected instantly in contact cards
  - **User Notifications**: Clear feedback when contacts are muted/unmuted
  - **Real-time Event System**: Custom events for immediate UI synchronization

### Changed
- **Contact Mute Behavior**: Enhanced contact mute functionality:
  - Updated `_toggleContactMute()` to use comprehensive UI update strategy
  - Improved `_handleUIControllerUpdate()` to force re-render for Chat7 components
  - Enhanced real-time listener to handle `contactMuteToggle` events
  - Added custom event dispatching for immediate UI updates

## [1.0.42] - 2024-12-29

### Fixed
- **Fixed Notification Sound Error**: Resolved "This is not a registered game setting" error for notification sounds:
  - **Root Cause**: `playNotificationSound` was attempting to access removed `notification-sound` setting
  - **Solution**: Updated to use localStorage for notification sound preferences
  - **Impact**: Notification sounds now work properly without errors

### Added
- **Enhanced Notification Sound System**: Improved notification sound functionality:
  - **Contact Mute Integration**: Notification sounds respect individual contact mute settings
  - **User Preference Control**: Users can toggle notification sounds on/off via `window.toggleNotificationSounds()`
  - **Smart Sound Logic**: Sounds only play when enabled AND contact is not muted
  - **localStorage Persistence**: Notification sound preferences stored in localStorage

### Changed
- **Notification Sound Logic**: Enhanced notification sound behavior:
  - Updated `playNotificationSound()` to accept sender and receiver IDs for mute checking
  - Added contact mute status verification before playing sounds
  - Improved error handling and logging for notification sound operations

## [1.0.41] - 2024-12-29

### Fixed
- **Fixed `clearConversationHistory` Error**: Resolved "This is not a registered game setting" error:
  - **Root Cause**: `clearConversationHistory` was attempting to save to removed `game.settings` key
  - **Solution**: Updated function to use localStorage only for all users (GM and non-GM)
  - **Impact**: Conversation clearing now works without errors and aligns with localStorage-only architecture

### Deprecated
- **GM Message Saving**: Deprecated `handleSaveMessagesRequest` function:
  - **Reason**: Messages now use localStorage-only architecture as requested
  - **Impact**: No more attempts to save messages to removed `game.settings`

### Changed
- **Message Persistence**: Aligned all message persistence with localStorage-only architecture:
  - Updated conversation clear notification handler to use localStorage for all users
  - Fixed SocketLib integration to not attempt saving to removed settings
  - Simplified message saving logic to use only localStorage

## [1.0.40] - 2024-12-29

### Fixed
- **SocketLib Architecture Overhaul**: Complete rewrite of SocketLib integration following official documentation:
  - **Root Cause**: Previous implementation was not following SocketLib's intended usage patterns
  - **Solution**: Implemented proper SocketLib initialization and function registration
  - **Impact**: Eliminates connection issues and enables proper real-time communication

### Removed
- **Unreliable Connection Checks**: Removed `socketlib.isConnected()` checks that were causing false negatives
- **Reconnection Logic**: Removed complex reconnection attempts that were not needed
- **Duplicate Registration Prevention**: Simplified function registration to follow official patterns

### Changed
- **SocketLib Initialization**: Now follows official SocketLib documentation:
  - Proper module registration in `socketlib.ready` hook
  - Immediate function registration after module registration
  - Simplified availability checks based on socket object existence
  - Removed unnecessary connection state management

### Technical
- Rewrote `initializeSocketLib()` to follow official SocketLib patterns
- Simplified `_isSocketLibAvailable()` to check only essential requirements
- Removed `_attemptSocketLibReconnection()` and `_forceSocketLibConnection()` methods
- Added `_checkSocketLibStatus()` for simplified status checking
- Updated global test functions to use new simplified methods

## [1.0.39] - 2024-12-29

## [1.0.38] - 2024-12-29

### Fixed
- **SocketLib Connection Issues**: Fixed critical SocketLib connection problems:
  - **Root Cause**: SocketLib was not connecting properly (`socketlibConnected: false`)
  - **Solution**: Added automatic reconnection attempts and improved initialization
  - **Impact**: Messages should now be sent via SocketLib for real-time communication

### Added
- **SocketLib Reconnection System**: Added robust SocketLib reconnection mechanism:
  - **Automatic Reconnection**: `_attemptSocketLibReconnection()` method for automatic connection recovery
  - **Connection Monitoring**: Enhanced `_isSocketLibAvailable()` to detect and attempt reconnection
  - **Manual Reconnection**: `window.forceSocketLibReconnection()` function for manual reconnection
  - **Immediate Initialization**: Added immediate SocketLib initialization if already available

### Changed
- **Enhanced SocketLib Initialization**: Improved SocketLib setup process:
  - Added immediate initialization attempt if SocketLib is already available
  - Enhanced connection testing and status reporting
  - Better error handling and logging for SocketLib operations
  - Improved reconnection logic with timeout-based retry mechanism

### Technical
- Added `_attemptSocketLibReconnection()` method with 10-second retry intervals
- Enhanced `setupSocketLibWhenReady()` with immediate initialization fallback
- Improved `_isSocketLibAvailable()` with automatic reconnection detection
- Added `window.forceSocketLibReconnection()` for manual troubleshooting
- Enhanced SocketLib connection status monitoring and reporting

## [1.0.37] - 2024-12-29

### Fixed
- **Real-time Communication via SocketLib**: Enhanced SocketLib integration for better real-time message delivery:
  - **Root Cause**: SocketLib message processing had potential issues with duplicate detection and error handling
  - **Solution**: Improved message processing logic and added better error handling
  - **Impact**: Messages should now appear in real-time on both sender and receiver clients

### Added
- **Enhanced SocketLib Debugging**: Added comprehensive debugging tools for SocketLib communication:
  - **Test Function**: `window.testRealtimeCommunication()` for testing SocketLib message delivery
  - **Connection Status**: Better logging of SocketLib connection and registration status
  - **Message Processing**: Enhanced logging for message sending and receiving via SocketLib

### Changed
- **Improved Message Processing**: Enhanced SocketLib message handling:
  - Added duplicate message detection to prevent processing the same message multiple times
  - Improved error handling and logging in `handleSendMessage()` function
  - Better organization of message processing logic within try-catch blocks
  - Enhanced logging for debugging SocketLib communication issues

### Technical
- Enhanced `handleSendMessage()` function with duplicate detection and better error handling
- Added `window.testRealtimeCommunication()` function for testing SocketLib functionality
- Improved logging in SocketLib message sending with detailed error information
- Better error handling and status reporting for SocketLib operations

## [1.0.36] - 2024-12-29

### Fixed
- **Infinite Loop and UI Freezing**: Fixed critical issue where sending messages caused infinite loops and UI freezing:
  - **Root Cause**: Multiple update strategies were creating circular dependencies and infinite re-render cycles
  - **Solution**: Implemented loop prevention mechanisms and simplified update strategies
  - **Impact**: Messages now appear immediately without freezing the UI or causing console loops

### Added
- **Loop Prevention System**: Added comprehensive loop prevention mechanisms:
  - **Update Flags**: `_isUpdating` and `_isRendering` flags to prevent concurrent updates
  - **Timeout Protection**: Automatic flag reset with timeouts to prevent permanent locks
  - **Conditional Updates**: Smart conditions to skip updates when already processing

### Changed
- **Simplified Update Strategy**: Streamlined message sending and UI update process:
  - Removed multiple conflicting update strategies from `_sendMessage()`
  - Simplified UI Controller updates to use single component marking
  - Reduced complexity in conversation update handlers
  - Enhanced logging for better debugging of update cycles

### Technical
- Added `_isUpdating` and `_isRendering` flags with timeout-based reset
- Modified `_forceRenderConversationView()` with loop prevention
- Updated `_renderConversationView()` to avoid `markConversationAsRead()` during re-renders
- Simplified `_sendMessage()` to use single UI Controller update strategy
- Enhanced `render()` method with loop prevention
- Improved error handling and logging throughout update cycles

## [1.0.35] - 2024-12-29

### Fixed
- **Message Persistence in Chat Conversations**: Fixed issue where sent messages didn't appear immediately in chat:
  - **Root Cause**: `_renderConversationView()` method wasn't forcing a complete re-render of the interface
  - **Solution**: Added `_forceRenderConversationView()` method that forces complete re-render with updated data
  - **Impact**: Messages now appear immediately after sending without requiring agent restart

### Added
- **Enhanced Chat Interface Updates**: Added robust re-rendering mechanism for conversation views:
  - **Force Re-render Method**: `_forceRenderConversationView()` ensures complete interface refresh
  - **Immediate Updates**: Messages appear instantly after sending
  - **Multiple Update Strategies**: UI Controller, force re-render, and custom events work together

### Changed
- **Improved Message Sending Flow**: Enhanced message sending process:
  - `_sendMessage()` now uses `_forceRenderConversationView()` for immediate updates
  - `_handleUIControllerUpdate()` uses force re-render for conversation components
  - Conversation real-time listeners use force re-render for better responsiveness

### Technical
- Added `_forceRenderConversationView()` method that calls `this.render(true)` for complete re-render
- Updated all conversation update paths to use force re-render instead of basic setup
- Enhanced logging for better debugging of message persistence issues
- Added `window.testMessagePersistence()` function for testing message persistence

## [1.0.34] - 2024-12-29

### Fixed
- **UIController Orphaned Components**: Fixed `Controller | Component or callback not found for: agent-conversation-*` warnings:
  - **Root Cause**: Components were marked as "dirty" but removed before update cycle
  - **Solution**: Added automatic cleanup of orphaned components and improved component validation
  - **Impact**: Eliminates console warnings and improves UI update performance

### Added
- **Enhanced UIController Management**: Added robust component lifecycle management:
  - **Component Validation**: `markDirtyMultiple()` now validates components before marking them dirty
  - **Orphaned Component Cleanup**: Automatic cleanup of components that no longer exist
  - **Status Monitoring**: New `getStatus()` method for debugging UIController state
  - **Debug Function**: `window.debugUIController()` for troubleshooting component issues

### Changed
- **Improved Logging**: Enhanced UIController logging for better debugging:
  - Separate logging for valid and invalid components in `markDirtyMultiple()`
  - Detailed status information in update cycles
  - Clear indication of orphaned component cleanup

### Technical
- Added `cleanupOrphanedComponents()` method to remove stale dirty states
- Enhanced `performUpdate()` to clean orphaned components before processing
- Added `getStatus()` method for comprehensive UIController state information
- Improved error handling and logging throughout UIController operations
- Added global `debugUIController()` function for troubleshooting

## [1.0.33] - 2024-12-29

### Fixed
- **Unregistered Settings Error**: Fixed critical `This is not a registered game setting` error:
  - **Root Cause**: `loadAgentData()` was trying to access unregistered `agent-data` setting
  - **Solution**: Moved `agent-data` from `game.settings` to `localStorage` to match the architectural pattern
  - **Impact**: Fixed Contact Manager settings persistence and player propagation issues
  - **Result**: Contact Manager now works correctly and settings persist after refresh

### Changed
- **Data Persistence Strategy**: Updated data storage approach:
  - `agent-data` now stored in `localStorage` instead of unregistered `game.settings`
  - `saveAgentData()` and `loadAgentData()` methods updated to use `localStorage`
  - `clearAllData()` method updated to clear `localStorage` items properly
  - Maintains consistency with other user-specific data (messages, read timestamps)

### Technical
- Updated `loadAgentData()` to load `agent-data` from `localStorage` with proper error handling
- Updated `saveAgentData()` to save `agent-data` to `localStorage` with user-specific keys
- Updated `clearAllData()` to remove `localStorage` items for messages, agent data, and read timestamps
- Enhanced error handling and logging for data persistence operations

## [1.0.32] - 2024-12-29

### Added
- **Diagnostic Test Functions**: Added comprehensive test functions to investigate Contact Manager settings persistence issues:
  - `window.testContactNetworkPersistence()`: Tests immediate settings save/retrieve functionality
  - `window.verifyContactNetworkPersistence()`: Verifies settings persistence after page refresh
  - `window.testPlayerContactNetworkAccess()`: Tests player access to GM's contact networks
  - `window.testContactManagerSave()`: Tests the actual Contact Manager save method
- Enhanced error logging and permission checking in diagnostic functions
- Detailed console output for debugging settings persistence issues

### Technical
- Added user permission checks (`game.user.role`, `game.user.can('SETTINGS_MODIFY')`)
- Added setting registration verification
- Added timeout-based verification to account for async settings operations
- Enhanced error handling with specific error types and detailed logging

## [1.0.31] - 2024-12-29

### Fixed
- **Contact Manager Settings Persistence**: Fixed issues with Contact Manager settings not persisting globally and not propagating to player agents:
  - Added `updateSetting` hook to automatically reload `contact-networks` when the setting changes
  - Enhanced `saveContactNetworks` to force `loadAgentData()` after saving and added detailed logging
  - Added new `reloadContactNetworks()` method for manual synchronization
  - Added safety checks in `addControlButton` to prevent `controls.find is not a function` errors
  - Added duplicate button prevention in token controls

### Technical
- Added `Hooks.on('updateSetting')` to trigger automatic data reload when contact networks change
- Enhanced logging in `saveContactNetworks` and `loadAgentData` methods
- Added `Array.isArray(controls)` validation in `addControlButton` and related hooks
- Added `reloadContactNetworks()` method for manual data synchronization

## [1.0.30] - 2024-12-29

### Fixed
- **Settings Registration Error**: Fixed `This is not a registered game setting` error loop when opening chat:
  - Simplified `_saveReadTimestamps()` and `_loadReadTimestamps()` methods to exclusively use `localStorage`
  - Removed references to the now-deleted `last-read-timestamps` setting
  - Ensured all read timestamp operations use `localStorage` only

### Technical
- Updated read timestamp persistence to use `localStorage` exclusively
- Removed all references to the deprecated `last-read-timestamps` setting
- Fixed error loop caused by attempting to access unregistered settings

## [1.0.29] - 2024-12-29

### Fixed
- **Controls Array Error**: Fixed `controls.find is not a function` error:
  - Added defensive checks (`Array.isArray(controls)`) in `addControlButton` method
  - Added validation in `renderSceneControls` hook to prevent errors when controls is not an array
  - Added duplicate button prevention to avoid multiple agent buttons

### Technical
- Enhanced `addControlButton` method with robust array validation
- Added safety checks in `renderSceneControls` hook
- Improved error handling for token control button addition

## [1.0.28] - 2024-12-29

### Fixed
- **Menu Button and Chat Errors**: Fixed multiple issues:
  - Agent menu button not appearing on initial client load
  - `getMessagesFromFoundryChat is not a function` error when opening chat
  - Added additional `renderSceneControls` hook with delay to ensure button appears on initial UI render
  - Corrected `getMessagesForConversation` method to remove calls to removed Foundry chat methods

### Technical
- Added `renderSceneControls` hook with 100ms delay for reliable button appearance
- Updated `getMessagesForConversation` to align with localStorage-only architecture
- Removed references to deleted `getMessagesFromFoundryChat` and `_mergeMessages` methods

## [1.0.27] - 2024-12-29

### Changed
- **Module Settings Cleanup**: Removed duplicate and unnecessary module settings:
  - Removed redundant "Gerenciador de Contatos" boolean setting
  - Kept only `contact-manager-menu` setting that provides button access
  - Cleaned up settings registration for a more streamlined configuration

### Technical
- Simplified `registerSettings()` method to only register essential settings
- Removed duplicate contact manager configuration options
- Streamlined module settings interface

## [1.0.26] - 2024-12-29

### Changed
- **Architectural Overhaul**: Complete decoupling from FoundryVTT chat system:
  - **Message Storage**: Moved all message storage to `localStorage` exclusively
  - **Foundry Chat Integration**: Removed all FoundryVTT chat posting, deletion, and synchronization
  - **Settings Cleanup**: Removed all Cyberpunk Agent settings except Contact Manager (GM-managed)
  - **SocketLib Only**: All communication now happens exclusively via SocketLib

### Removed
- All FoundryVTT chat integration methods (`_createFoundryChatMessage`, `_handleNewChatMessage`, etc.)
- All message synchronization with Foundry chat
- All module settings except `contact-networks` and `contact-manager-menu`
- All Foundry chat notification systems

### Technical
- Refactored `saveMessages()` and `loadMessages()` to use `localStorage` only
- Removed `_requestGMSaveMessages()` and related GM request methods
- Simplified `getMessagesForConversation()` to remove Foundry chat merging
- Updated `clearConversationHistory()` to use `localStorage` only
- Removed all `game.settings` usage for user-specific data

## [1.0.25] - 2024-12-29

### Fixed
- **Context Menu Issues**: Fixed multiple context menu problems:
  - Context menu not disappearing when options are selected
  - `TypeError: undefined. Cannot read properties of null (reading 'id')` error
  - Added explicit DOM removal (`$('.cp-context-menu').remove()`) to all context menu click handlers
  - Added defensive checks for `this.currentContact` and `this.currentContact.id`

### Technical
- Enhanced `_showContextMenu` method with proper cleanup
- Added null/undefined checks in `_setupConversationRealtimeListener`, `_handleUIControllerUpdate`, `_getComponentIds`, `_sendMessage`, and `getData` methods
- Improved error handling for context menu operations

## [1.0.24] - 2024-12-29

### Added
- **Conversation History Management**: Added ability to clear conversation history:
  - New context menu option "Limpar Histórico" for clearing conversation history
  - History clearing affects only the user who initiated the action
  - Other users' conversation history remains intact unless they also clear it
  - SocketLib notification system for cross-client synchronization

### Technical
- Added `clearConversationHistory()` method for clearing specific conversations
- Added `_notifyConversationClear()` method for SocketLib notifications
- Added `handleConversationClear()` method for processing clear notifications
- Enhanced context menu with new clear history option

## [1.0.23] - 2024-12-29

### Fixed
- **UI Rendering Issues**: Fixed multiple UI rendering problems:
  - `Messages container not found!` error when opening chat
  - Removed manual DOM manipulation from `_renderConversationView()`
  - Ensured `getData()` provides all necessary data for Handlebars templating
  - Simplified `_renderChat7View()` for better reliability

### Technical
- Removed manual DOM manipulation logic from conversation rendering
- Enhanced `getData()` method to provide complete data for templates
- Improved error handling in UI rendering methods

## [1.0.22] - 2024-12-29

### Added
- **Flutter-like UI Update System**: Implemented a sophisticated UI update mechanism:
  - Global `UIController` class for managing UI component updates
  - "Dirty" component marking system for efficient re-rendering
  - UI tree structure with callback-based update propagation
  - Automatic rebuild scheduling and execution

### Technical
- Added `UIController` class with component registration and update management
- Implemented `markDirty()`, `markDirtyMultiple()`, and `markAllDirty()` methods
- Added scheduled update system with debouncing
- Enhanced `_updateChatInterfacesImmediately()` and `handleMessageUpdate()` to use new UI system

## [1.0.21] - 2024-12-29

### Fixed
- **Real-time Chat Updates**: Fixed issues with real-time message updates:
  - Messages not appearing immediately when sent
  - Send button not working (only Enter key worked)
  - Corrected send button selector in `_activateConversationListeners()`
  - Added immediate re-render after sending messages

### Technical
- Fixed send button event listener attachment
- Enhanced `_sendMessage()` to trigger immediate UI update
- Improved conversation view rendering after message sending

## [1.0.20] - 2024-12-29

### Fixed
- **Contact List Display**: Fixed contact list not displaying contacts:
  - Updated `getData()` to pass contact data directly to Handlebars
  - Simplified `_renderChat7View()` for better data flow
  - Ensured proper data structure for template rendering

### Technical
- Enhanced data passing to Handlebars templates
- Improved contact list rendering logic
- Fixed data structure issues in Chat7 view

## [1.0.19] - 2024-12-29

### Fixed
- **Application Instance Management**: Fixed issue with multiple Agent popups:
  - Refactored application architecture to use single `AgentApplication` instance
  - Implemented view-based navigation within single application window
  - Removed multiple `FormApplication` instances in favor of unified approach

### Technical
- Consolidated multiple application classes into single `AgentApplication`
- Implemented internal view switching instead of new window creation
- Enhanced navigation logic for better user experience

## [1.0.18] - 2024-12-29

### Fixed
- **Contact List UI Updates**: Fixed contact list not refreshing properly:
  - Added automatic refresh when opening contact list screen
  - Added real-time updates when new messages arrive
  - Added refresh when "mark all messages as read" is used
  - Enhanced UI update mechanisms for better responsiveness

### Technical
- Enhanced `_updateChat7Interfaces()` method for better re-rendering
- Added automatic UI refresh on contact list opening
- Improved real-time update propagation for contact list

## [1.0.17] - 2024-12-29

### Fixed
- **Unread Message Count Updates**: Fixed unread message chip issues:
  - Chips not resetting when chat is opened
  - Chips not updating in real-time when new messages arrive
  - Enhanced `markConversationAsRead()` to clear unread count cache
  - Added `_updateChatInterfacesImmediately()` for better real-time updates

### Technical
- Enhanced unread count management and caching
- Improved real-time UI update mechanisms
- Added better error handling for unread count operations

## [1.0.16] - 2024-12-29

### Changed
- **Notification System**: Moved notifications from UI to console:
  - Removed "interface updated" notifications from UI
  - Moved "Mensagens salvas com sucesso" notifications to console
  - Enhanced console logging for better debugging

### Technical
- Replaced `ui.notifications.info` calls with `console.log`
- Improved console logging for system operations
- Enhanced debugging information in console

## [1.0.15] - 2024-12-29

### Added
- **Enhanced Contact Management**: Added new contact management features:
  - "Mark all messages as read" option in contact context menu
  - Real-time unread count updates in contact list
  - Automatic marking of messages as read when opening chat
  - Enhanced contact list UI with better unread message indicators

### Technical
- Added `markConversationAsRead()` method for bulk read operations
- Enhanced unread count tracking and display
- Improved contact list UI with real-time updates

## [1.0.14] - 2024-12-29

### Fixed
- **Scrollbar Issues**: Fixed scrollbar visibility problems:
  - Added scrollbar for players in Agent interface
  - Changed CSS from `overflow: hidden` to `overflow-y: auto; overflow-x: hidden`
  - Ensured consistent scrollbar behavior for both GM and players

### Technical
- Updated CSS classes for better scrollbar management
- Enhanced overflow handling in Agent interface
- Improved user experience for both GM and players

## [1.0.13] - 2024-12-29

### Changed
- **Chat Scrolling Behavior**: Modified chat interface scrolling:
  - Removed automatic scroll to bottom on new messages
  - Messages still appear immediately but scroll remains manual
  - Improved user control over chat navigation

### Technical
- Removed `_scrollToBottom()` and `_scrollToBottomOnNewMessage()` calls
- Enhanced chat interface for manual scroll control
- Maintained real-time message display without forced scrolling

## [1.0.12] - 2024-12-29

### Fixed
- **Message Flow Issues**: Fixed critical message flow problems:
  - Player messages not reaching GM
  - Infinite console loop with system messages
  - Enhanced message filtering to prevent system message loops
  - Improved SocketLib communication reliability

### Technical
- Added system message filtering in `handleSendMessage()`
- Fixed `_sendSaveRequestViaSocketLib()` return value handling
- Enhanced error handling for SocketLib communications
- Improved message flow between GM and players

## [1.0.11] - 2024-12-29

### Fixed
- **Player Permission Issues**: Fixed permission-related errors:
  - `User Bruno lacks permission to update Setting` error
  - Changed `last-read-timestamps` setting scope to `client`
  - Implemented hybrid `game.settings`/`localStorage` persistence for read timestamps
  - Enhanced permission handling for different user roles

### Technical
- Updated setting scope for better permission management
- Enhanced read timestamp persistence strategy
- Improved error handling for permission-related operations

## [1.0.10] - 2024-12-29

### Fixed
- **SocketLib Error Logs**: Fixed false positive SocketLib error logs:
  - Relaxed `_isSocketLibAvailable()` logic to reduce false positives
  - Suppressed error notifications when SocketLib is actually working
  - Enhanced SocketLib availability checking

### Technical
- Improved SocketLib availability detection
- Enhanced error logging to reduce noise
- Better handling of SocketLib integration status

## [1.0.9] - 2024-12-29

### Added
- **Real-time Chat Functionality**: Implemented real-time chat between GM and players:
  - SocketLib integration for real-time message exchange
  - Live message updates without page refresh
  - Enhanced user experience with immediate message delivery

### Technical
- Added SocketLib integration for real-time communications
- Implemented message synchronization across clients
- Enhanced chat interface with real-time updates

## [1.0.8] - 2024-12-29

### Added
- **Contact Management System**: Implemented comprehensive contact management:
  - Contact Manager interface for GM to manage character contacts
  - Contact assignment and removal functionality
  - Contact list display in Agent interface
  - Enhanced contact management workflow

### Technical
- Added ContactManagerApplication class
- Implemented contact assignment and management logic
- Enhanced Agent interface with contact list functionality

## [1.0.7] - 2024-12-29

### Added
- **Agent Interface**: Implemented main Agent interface:
  - AgentHomeApplication for main Agent screen
  - Chat7Application for messaging functionality
  - Basic messaging system between characters
  - Enhanced user interface for Agent operations

### Technical
- Added AgentHomeApplication and Chat7Application classes
- Implemented basic messaging functionality
- Enhanced UI components for Agent interface

## [1.0.6] - 2024-12-29

### Added
- **Token Control Integration**: Added Agent access through token controls:
  - Agent button in token control toolbar
  - Easy access to Agent interface for character management
  - Enhanced integration with FoundryVTT token system

### Technical
- Added token control button integration
- Enhanced Agent accessibility through token controls
- Improved user experience for Agent access

## [1.0.5] - 2024-12-29

### Added
- **Basic Module Structure**: Implemented foundational module structure:
  - Core CyberpunkAgent class
  - Basic settings registration
  - Module initialization and cleanup
  - Enhanced module architecture

### Technical
- Added core CyberpunkAgent class implementation
- Implemented basic settings management
- Enhanced module lifecycle management

## [1.0.4] - 2024-12-29

### Added
- **Initial Module Setup**: Created basic module infrastructure:
  - Module manifest and configuration
  - Basic file structure and organization
  - Initial CSS styling
  - Enhanced module foundation

### Technical
- Created module.json with basic configuration
- Implemented initial CSS styling
- Enhanced module file organization

## [1.0.3] - 2024-12-29

### Added
- **Project Foundation**: Established project foundation:
  - Basic project structure
  - Initial documentation
  - Enhanced project organization

### Technical
- Created basic project structure
- Added initial documentation
- Enhanced project organization

## [1.0.2] - 2024-12-29

### Added
- **Initial Development**: Started initial development:
  - Basic module concept
  - Enhanced development planning

### Technical
- Started initial module development
- Enhanced development planning

## [1.0.1] - 2024-12-29

### Added
- **Project Initialization**: Initialized project:
  - Basic project setup
  - Enhanced project initialization

### Technical
- Initialized project structure
- Enhanced project setup

## [1.0.0] - 2024-12-29

### Added
- **Initial Release**: First release of Cyberpunk Agent module:
  - Basic module functionality
  - Enhanced initial features

### Technical
- Initial module release
- Enhanced basic functionality 