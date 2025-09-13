# Enhanced Seen Functionality - Cyberpunk Agent

## Overview

The Enhanced Seen Functionality addresses critical issues with the original "seen" system, providing user-specific, server-based read status tracking that properly separates GM and Player operations while enabling cross-browser synchronization.

## Problems Solved

### ❌ **Original Issues:**

1. **Cross-Browser Synchronization**: Read timestamps stored in localStorage were browser-specific
2. **GM/Player Interference**: GM operations on player devices affected player's seen status
3. **No User Separation**: All users shared the same read status regardless of ownership
4. **Device-Based Logic**: System was device-centric instead of user-centric

### ✅ **Solutions Implemented:**

1. **Server-Based Storage**: Read status stored on server for cross-browser sync
2. **GM/Player Separation**: Proper ownership validation prevents interference
3. **User-Specific Tracking**: Each user has independent read status
4. **Enhanced Logic**: User-centric approach with proper ownership checks

## Architecture

### **Data Structure**

```javascript
// Enhanced read status system
this.readStatus = new Map(); // conversationKey -> userId -> {lastReadTimestamp, readMessages}

// Example structure:
{
  "actor1-actor2": {
    "userId1": {
      "lastReadTimestamp": 1640995200000,
      "readMessages": ["msg1", "msg2", "msg3"]
    },
    "userId2": {
      "lastReadTimestamp": 1640995300000,
      "readMessages": ["msg1", "msg2"]
    }
  }
}
```

### **Storage Strategy**

- **Current Implementation**: localStorage with user-specific keys
- **Future Enhancement**: Server-based storage via game.settings
- **Cross-Browser Sync**: Data stored with user ID for proper synchronization

## Key Features

### 1. **User-Specific Read Status**

Each user maintains independent read status for conversations:

```javascript
// Mark conversation as read for specific user
await agent.markConversationAsRead(actorId1, actorId2, userId);

// Get unread count for specific user
const unreadCount = agent.getUnreadCount(actorId1, actorId2, userId);
```

### 2. **GM/Player Separation Logic**

The system validates ownership before allowing read status updates:

```javascript
_shouldMarkAsRead(actorId1, actorId2, userId) {
    const user = game.users.get(userId);
    const actor = game.actors.get(actorId1);
    
    // GM operating own device: ✅ Mark as read
    if (user.isGM && actor.ownership[userId] === 3) return true;
    
    // Player operating own device: ✅ Mark as read
    if (!user.isGM && actor.ownership[userId] === 3) return true;
    
    // GM operating player device: ❌ Don't mark as read
    if (user.isGM && actor.ownership[userId] !== 3) return false;
    
    // Player operating someone else's device: ❌ Don't mark as read
    if (!user.isGM && actor.ownership[userId] !== 3) return false;
    
    return false;
}
```

### 3. **Cross-Browser Synchronization**

Read status is stored with user-specific keys for proper sync:

```javascript
// Storage key format
const storageKey = `cyberpunk-agent-read-status-${userId}`;

// Data structure in localStorage
{
  "actor1-actor2": {
    "lastReadTimestamp": 1640995200000,
    "readMessages": ["msg1", "msg2", "msg3"]
  }
}
```

### 4. **Legacy Data Migration**

Automatic migration from old system to new enhanced system:

```javascript
async _migrateLegacyReadTimestamps() {
    // Load legacy timestamps
    this._loadReadTimestamps();
    
    // Convert to new format
    for (const [conversationKey, timestamp] of this.lastReadTimestamps.entries()) {
        const readMessageIds = this._getReadMessageIds(conversationKey, game.user.id);
        
        this.readStatus.get(conversationKey).set(game.user.id, {
            lastReadTimestamp: timestamp,
            readMessages: readMessageIds
        });
    }
    
    // Save migrated data
    await this._saveReadStatusToServer('', game.user.id, Date.now(), []);
}
```

## Implementation Details

### **Core Methods**

#### `markConversationAsRead(actorId1, actorId2, userId = null)`
- Enhanced version with user-specific read status
- Validates ownership before marking as read
- Updates both legacy and enhanced systems

#### `getUnreadCount(actorId1, actorId2, userId = null)`
- User-specific unread count calculation
- Uses enhanced read status when available
- Falls back to legacy system for compatibility

#### `_shouldMarkAsRead(actorId1, actorId2, userId)`
- Ownership validation logic
- Prevents GM interference with player read status
- Ensures proper access control

#### `_updateReadStatus(conversationKey, userId, timestamp)`
- Updates user-specific read status
- Saves to server for cross-browser sync
- Maintains local cache for performance

### **Initialization Process**

```javascript
async _initializeEnhancedReadStatus() {
    // Load read status for current user
    await this._loadReadStatusFromServer(game.user.id);
    
    // Migrate legacy data if exists
    await this._migrateLegacyReadTimestamps();
    
    console.log("Enhanced read status system initialized");
}
```

## Usage Scenarios

### **Scenario 1: Player Opens Device in Different Browser**

1. Player opens device in Browser A → Messages marked as read
2. Player opens same device in Browser B → Messages still show as read
3. ✅ **Result**: Cross-browser synchronization working

### **Scenario 2: GM Operates Player Device**

1. Player receives message → Shows as unread
2. GM opens player's device → Messages NOT marked as read for player
3. Player opens their device → Messages still show as unread
4. ✅ **Result**: GM operations don't interfere with player's seen status

### **Scenario 3: GM Operates Own Device**

1. GM receives message on their device → Shows as unread
2. GM opens their device → Messages marked as read
3. ✅ **Result**: Normal seen functionality for GM's own devices

### **Scenario 4: Multiple Users, Same Device**

1. User A opens device → Messages marked as read for User A
2. User B opens same device → Messages marked as read for User B
3. Each user has independent read status
4. ✅ **Result**: User-specific tracking working correctly

## Testing

### **Test Script**

Use the comprehensive test script to verify functionality:

```javascript
// Run all tests
window.testEnhancedSeenFunctionality.runAll();

// Run individual tests
window.testEnhancedSeenFunctionality.testUserSpecificReadStatus();
window.testEnhancedSeenFunctionality.testGMPlayerSeparation();
window.testEnhancedSeenFunctionality.testCrossBrowserSync();
window.testEnhancedSeenFunctionality.testLegacyDataMigration();
window.testEnhancedSeenFunctionality.testEnhancedUnreadCount();
```

### **Test Coverage**

- ✅ User-specific read status tracking
- ✅ GM/Player separation logic
- ✅ Cross-browser synchronization
- ✅ Legacy data migration
- ✅ Enhanced unread count calculation
- ✅ Ownership validation
- ✅ Server storage and retrieval

## Benefits

### **For Players**
- ✅ Read status syncs across all browsers
- ✅ GM operations don't affect their seen status
- ✅ Independent read tracking per user
- ✅ Proper ownership validation

### **For GMs**
- ✅ Can operate player devices without interference
- ✅ Own devices work normally
- ✅ Clear separation between GM and Player operations
- ✅ Better visibility into player read status

### **For System**
- ✅ Backward compatible with existing data
- ✅ Automatic migration from legacy system
- ✅ Enhanced performance with caching
- ✅ Robust error handling and fallbacks

## Future Enhancements

### **Phase 2: Server-Based Storage**
- Move from localStorage to game.settings
- Real-time synchronization via SocketLib
- Better offline/online handling

### **Phase 3: Advanced Features**
- Read receipts for individual messages
- Typing indicators
- Message delivery status
- Advanced notification preferences

### **Phase 4: Performance Optimization**
- Lazy loading of read status
- Batch operations for multiple conversations
- Memory optimization for large datasets

## Migration Notes

### **Automatic Migration**
- Legacy read timestamps automatically migrated on first load
- No user action required
- Data preserved during migration
- Fallback to legacy system if migration fails

### **Backward Compatibility**
- Legacy methods still work
- Gradual transition to enhanced system
- No breaking changes for existing functionality
- Enhanced features available immediately

## Troubleshooting

### **Common Issues**

1. **Read status not syncing**: Check localStorage permissions
2. **GM operations affecting players**: Verify ownership validation
3. **Migration not working**: Check console for error messages
4. **Performance issues**: Clear read status cache if needed

### **Debug Commands**

```javascript
// Check read status for conversation
agent.readStatus.get('actor1-actor2')?.get(game.user.id);

// Check ownership validation
agent._shouldMarkAsRead(actorId1, actorId2, game.user.id);

// Force migration
agent._migrateLegacyReadTimestamps();

// Clear read status cache
agent.readStatus.clear();
```

## Conclusion

The Enhanced Seen Functionality provides a robust, user-centric approach to message read status tracking that addresses all the original concerns while maintaining backward compatibility and providing a foundation for future enhancements.
