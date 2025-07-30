# Changelog

All notable changes to this project will be documented in this file.

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