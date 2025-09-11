# Enhanced Message Persistence - Cyberpunk Agent

## Overview

The Cyberpunk Agent module now implements an **Enhanced Server-First Message Persistence System** that ensures messages are never lost when users switch browsers, use incognito mode, or have localStorage cleared. This system makes game settings the primary source of truth while using localStorage as a performance cache.

## The Problem Solved

### Before Enhancement
- **localStorage Dependency**: Messages primarily stored in browser's localStorage
- **Cross-Browser Issues**: Switching browsers or incognito mode lost messages
- **Incomplete Sync**: Sync only happened when agent opened, could miss messages
- **No Recovery**: No way to recover from localStorage corruption/clearing

### After Enhancement
- **Server-First**: All messages immediately saved to game settings (server)
- **Cross-Browser Sync**: Messages persist across any browser/device
- **Comprehensive Sync**: Multiple sync points ensure no message loss
- **Automatic Recovery**: System automatically restores messages from server

## Architecture

### Enhanced Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Device   │    │   User Device   │    │   User Device   │
│   (Browser 1)   │    │   (Browser 2)   │    │  (Incognito)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Foundry VTT Server     │
                    │  (PRIMARY STORAGE)        │
                    │  - game.settings          │
                    │  - server-messages        │
                    │  - Immediate Persistence  │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    localStorage Cache     │
                    │  (PERFORMANCE CACHE)      │
                    │  - Immediate UI Feedback  │
                    │  - Offline Performance    │
                    │  - Auto-Restored on Load  │
                    └───────────────────────────┘
```

## Key Features

### 1. Server-First Persistence
- **Primary Storage**: All messages immediately saved to `game.settings`
- **Guaranteed Persistence**: Messages never lost, even if localStorage fails
- **Cross-Session**: Messages persist across browser restarts/changes

### 2. Comprehensive Sync System
- **Module Load Sync**: Complete sync when module initializes
- **Agent Open Sync**: Sync when opening agent interface (with progress)
- **Periodic Sync**: Background sync every 10 minutes
- **Manual Sync**: User-accessible sync button in agent interface

### 3. Intelligent Caching
- **localStorage Cache**: Fast local access for UI responsiveness
- **Server Authority**: Server always wins in conflicts
- **Smart Merging**: Combines local and server state intelligently

### 4. Cross-Browser Support
- **Clean State Recovery**: Works perfectly with empty localStorage
- **Incognito Support**: Full functionality in private browsing
- **Device Independence**: Messages accessible from any device/browser

## Implementation Details

### Enhanced Message Saving

```javascript
// OLD: localStorage first, server second
await this.saveMessagesForDevice(deviceId);
await this.requestGMMessageSave(senderDeviceId, receiverDeviceId, message);

// NEW: Server first, localStorage cache
const serverSaveSuccess = await this.saveMessageToServerAsGM(senderDeviceId, receiverDeviceId, message);
await this.saveMessagesForDevice(deviceId); // Cache for performance
```

### Comprehensive Sync Process

```javascript
async syncMessagesWithServer(deviceId, showProgress = false) {
    // 1. Get server state (authoritative)
    const serverMessages = game.settings.get('cyberpunk-agent', 'server-messages') || {};
    
    // 2. Find device conversations
    const deviceConversations = {};
    for (const [conversationKey, messages] of Object.entries(serverMessages)) {
        if (conversationKey.includes(deviceId)) {
            deviceConversations[conversationKey] = messages;
        }
    }
    
    // 3. Merge with local state (server wins)
    for (const [conversationKey, serverConversation] of Object.entries(deviceConversations)) {
        const localConversation = this.messages.get(conversationKey) || [];
        const mergedConversation = this.mergeConversations(localConversation, serverConversation);
        this.messages.set(conversationKey, mergedConversation);
    }
    
    // 4. Update cache and UI
    await this.saveMessagesForDevice(deviceId);
    this._updateChatInterfacesImmediately();
}
```

### Initial Sync on Module Load

```javascript
async performInitialMessageSync() {
    // Get all user devices
    const userDevices = this.getUserDevices();
    
    // Sync each device comprehensively
    for (const deviceId of userDevices) {
        await this.syncMessagesWithServer(deviceId, false);
    }
    
    // Notify user of sync completion
    ui.notifications.info(`Cyberpunk Agent: ${userDevices.length} dispositivos sincronizados`);
}
```

## User Experience Enhancements

### 1. Sync Progress Feedback
- **Loading Messages**: "Sincronizando mensagens com servidor..."
- **Completion Status**: "Sincronização concluída: X novas mensagens"
- **Error Handling**: Clear error messages if sync fails

### 2. Manual Sync Button
- **Location**: Top-right corner of agent interface
- **Visual Feedback**: Spinning icon during sync
- **Tooltip**: "Sincronizar mensagens com servidor"
- **One-Click**: Instant manual synchronization

### 3. Automatic Background Sync
- **Frequency**: Every 10 minutes
- **Silent Operation**: No user interruption
- **Error Recovery**: Automatic retry on failure

## Cross-Browser Scenario Testing

### Scenario 1: New Browser
1. User opens FoundryVTT in new browser
2. localStorage is empty
3. Module loads and runs `performInitialMessageSync()`
4. All messages restored from server
5. User sees complete message history

### Scenario 2: Incognito Mode
1. User opens FoundryVTT in incognito/private window
2. No persistent localStorage
3. Every agent open triggers sync with server
4. Messages always available from server
5. Full functionality maintained

### Scenario 3: localStorage Corruption
1. localStorage data becomes corrupted/cleared
2. User opens agent interface
3. Sync detects missing messages
4. Server data restores complete state
5. User experience uninterrupted

## Configuration

### Server Settings Structure

```javascript
// game.settings.get('cyberpunk-agent', 'server-messages')
{
  "device-1_device-2": [
    {
      id: "msg-001",
      senderId: "device-1",
      receiverId: "device-2", 
      text: "Hello from device 1",
      timestamp: 1640995200000,
      time: "14:30",
      read: false
    }
  ]
}
```

### Sync Settings

```javascript
// Periodic sync interval (10 minutes)
const syncInterval = 10 * 60 * 1000;

// Initial sync on module load
const performInitialSync = true;

// Show sync progress to user
const showSyncProgress = true; // On agent open
const showSyncProgress = false; // On periodic sync
```

## Testing

### Test Script
Use the comprehensive test script to verify functionality:

```javascript
// Run all enhanced persistence tests
runAllEnhancedPersistenceTests();

// Individual tests
testEnhancedMessagePersistence(); // Server-first saving
testPeriodicSync();               // Background sync
testManualSyncButton();          // UI sync button
```

### Manual Testing Steps

1. **Cross-Browser Test**:
   - Send messages in Browser A
   - Open FoundryVTT in Browser B
   - Verify all messages appear

2. **Incognito Test**:
   - Send messages in normal window
   - Open FoundryVTT in incognito
   - Verify messages sync automatically

3. **localStorage Clear Test**:
   - Clear browser data
   - Reload FoundryVTT
   - Verify messages restore from server

## Performance Considerations

### Optimizations
- **Batch Operations**: Multiple messages saved together
- **Intelligent Merging**: Only sync changed conversations
- **Cache Strategy**: localStorage provides instant UI feedback
- **Background Sync**: Non-blocking periodic updates

### Resource Usage
- **Network**: Minimal - only sync deltas when possible
- **Storage**: Game settings store complete message history
- **Memory**: In-memory cache for active conversations
- **CPU**: Efficient merge algorithms

## Migration from Previous System

### Automatic Migration
The enhanced system is fully backward compatible:

1. **Existing Messages**: Preserved in current storage
2. **Gradual Enhancement**: Messages enhanced as they're accessed
3. **No Data Loss**: All existing functionality maintained
4. **Transparent Upgrade**: Users see improved reliability immediately

### Migration Process
1. Module loads with enhanced system
2. Existing localStorage messages remain functional
3. New messages use server-first approach
4. Sync gradually populates server storage
5. Complete migration achieved over time

## Troubleshooting

### Common Issues

#### Messages Not Syncing
**Symptoms**: Messages don't appear in new browser
**Solution**: Check GM permissions and server settings
**Debug**: Console shows sync status and errors

#### Sync Button Not Working
**Symptoms**: Manual sync button doesn't respond
**Solution**: Verify SocketLib integration is working
**Debug**: Check console for SocketLib errors

#### Performance Issues
**Symptoms**: Slow message loading
**Solution**: Clear localStorage cache and re-sync
**Debug**: Monitor sync completion times

### Debug Commands

```javascript
// Check server message storage
console.log(game.settings.get('cyberpunk-agent', 'server-messages'));

// Force comprehensive sync
await window.CyberpunkAgent.instance.performInitialMessageSync();

// Test cross-browser simulation
localStorage.clear();
await window.CyberpunkAgent.instance.syncMessagesWithServer(deviceId, true);
```

## Benefits Summary

### For Users
- ✅ **Never Lose Messages**: Messages persist across any browser/device
- ✅ **Seamless Experience**: Automatic sync with progress feedback
- ✅ **Manual Control**: Sync button for immediate synchronization
- ✅ **Incognito Support**: Full functionality in private browsing

### For GMs
- ✅ **Centralized Storage**: All messages stored in game settings
- ✅ **No Data Loss**: Reliable message persistence
- ✅ **Easy Management**: Standard FoundryVTT data management
- ✅ **Backup Integration**: Messages included in world backups

### For Developers
- ✅ **Clean Architecture**: Server-first with cache pattern
- ✅ **Comprehensive Testing**: Full test suite included
- ✅ **Error Handling**: Robust error recovery
- ✅ **Performance Optimized**: Efficient sync algorithms

## Conclusion

The Enhanced Message Persistence System transforms the Cyberpunk Agent module from a localStorage-dependent system to a robust, server-first architecture that guarantees message persistence across any browser or device. Users can now confidently switch browsers, use incognito mode, or clear their browser data without losing any messages from their agent devices.

This enhancement maintains full backward compatibility while providing a significantly improved user experience and reliability.
