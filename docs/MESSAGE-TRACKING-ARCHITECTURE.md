# Message Tracking Architecture - Cyberpunk Agent

## Overview

The Cyberpunk Agent module implements a sophisticated message tracking system that integrates with FoundryVTT's chat functionality to provide real-time notifications for both GMs and players. This system provides message previews, tracking notifications, and seamless integration between the Chat7 system and FoundryVTT's native chat.

## Architecture Components

### 1. Message Flow System

```
Player A sends message → Chat7 Interface → Device Message System
                                                      ↓
                                              Message Processing
                                                      ↓
                                    ┌─────────────────┼─────────────────┐
                                    ↓                 ↓                 ↓
                            SocketLib Delivery    Server Storage    Chat Notifications
                                    ↓                 ↓                 ↓
                            Real-time Updates    Offline Queue    GM/Player Tracking
```

### 2. Core Components

#### A. Message Processing Pipeline
- **Entry Point**: `sendDeviceMessage(senderDeviceId, receiverDeviceId, text)`
- **Storage**: Messages stored in server-side data structure
- **Real-time Delivery**: SocketLib for immediate updates
- **Fallback**: Server storage for offline users
- **Notifications**: Chat-based tracking system
- **Receiver Notifications**: Triggered when messages are received via SocketLib

#### B. Tracking Notification System
- **GM Tracking**: `_sendGMTrackingNotification()` - Shows all message exchanges to GMs
- **Player Notifications**: `_sendPlayerNotification()` - Shows message previews to involved players
- **Receiver Notifications**: `_sendReceiverChatPreviewNotification()` - Shows previews when messages are received
- **Settings Control**: Configurable via module settings

## Implementation Details

### 1. Message Tracking Flow

```javascript
// Main entry point for device messages
async sendDeviceMessage(senderDeviceId, receiverDeviceId, text) {
    // 1. Validate inputs and create message object
    const message = {
        id: generateUniqueId(),
        senderId: senderDeviceId,
        receiverId: receiverDeviceId,
        text: text.trim(),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString()
    };

    // 2. Store message in conversation
    const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);
    const conversation = this.messages.get(conversationKey) || [];
    conversation.push(message);
    this.messages.set(conversationKey, conversation);

    // 3. Save to server storage
    await this.saveMessageToServer(senderDeviceId, receiverDeviceId, message);

    // 4. Attempt real-time delivery via SocketLib
    if (this._isSocketLibAvailable()) {
        await this.socketLibIntegration.sendMessage(senderDeviceId, receiverDeviceId, text, messageId);
    }

    // 5. Update local interfaces
    this._updateChatInterfacesImmediately();

    // 6. Send tracking notifications
    await this._sendMessageTrackingNotifications(senderDeviceId, receiverDeviceId, text, message);
}
```

### 2. GM Tracking Notifications

```javascript
async _sendGMTrackingNotification(senderActor, receiverActor, text, message) {
    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
    
    const content = `
        <div class="cyberpunk-agent-tracking-notification">
            <div class="tracking-header">
                <i class="fas fa-exchange-alt"></i>
                <strong>New Message Exchange</strong>
                <span class="tracking-time">${timestamp}</span>
            </div>
            <div class="tracking-route">
                <span class="sender">${senderActor.name}</span>
                <i class="fas fa-arrow-right"></i>
                <span class="receiver">${receiverActor.name}</span>
            </div>
            <div class="tracking-content">
                <strong>Message:</strong> ${text}
            </div>
        </div>
    `;

    await ChatMessage.create({
        user: game.user.id,
        speaker: { alias: "Cyberpunk Agent" },
        content: content,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        whisper: gmUsers,
        blind: true,
        flags: {
            'cyberpunk-agent': {
                isTrackingNotification: true,
                messageId: message.id,
                senderId: senderActor.id,
                receiverId: receiverActor.id
            }
        }
    });
}
```

### 3. GM-Only Tracking System

The system now focuses exclusively on GM tracking for monitoring player communications:

```javascript
// Only GM tracking notifications are sent
const gmTrackingEnabled = game.settings.get('cyberpunk-agent', 'gm-message-tracking');
if (gmTrackingEnabled) {
    await this._sendGMTrackingNotification(senderActor, receiverActor, text, message);
}
```

**Benefits:**
- **GM Oversight**: GMs can monitor all player communications in real-time
- **Privacy**: Players don't see chat notifications - messages only appear in their agent interfaces
- **Simplicity**: Single setting controls the entire tracking system
- **Reliability**: No complex player notification logic to maintain

## Chat Preview Notifications (Experimental Feature)

### Overview
The system includes documentation for a chat preview notification feature that would create smartphone-like notification cards in the FoundryVTT chat. However, this feature appears to be **documented but not yet implemented** in the current codebase.

### Intended Functionality
- **Smartphone-style notifications** in FoundryVTT chat
- **Interactive buttons** to open Chat7 or dismiss notifications
- **Preview of message content** (first 100 characters)
- **Permission-based visibility** (only involved parties see notifications)
- **Mute system integration** (respects contact mute settings)

### Template Structure (Planned)
```html
<div class="cyberpunk-agent-chat-preview">
  <div class="cp-preview-header">
    <div class="cp-preview-icon">
      <i class="fas fa-mobile-alt"></i>
    </div>
    <div class="cp-preview-title">
      <span class="cp-preview-app">CHAT7</span>
      <span class="cp-preview-subtitle">Nova Mensagem</span>
    </div>
    <div class="cp-preview-time">{{timestamp}}</div>
  </div>
  
  <div class="cp-preview-content">
    <div class="cp-preview-sender">
      <img src="{{senderImg}}" alt="{{senderName}}" />
      <span class="cp-preview-sender-name">{{senderName}}</span>
    </div>
    
    <div class="cp-preview-message">
      <div class="cp-preview-text">{{messagePreview}}</div>
    </div>
    
    <div class="cp-preview-actions">
      <button data-action="open-chat7">Abrir</button>
      <button data-action="dismiss">Fechar</button>
    </div>
  </div>
</div>
```

## Settings and Configuration

### Module Settings
- **GM Message Tracking**: `game.settings.get('cyberpunk-agent', 'gm-message-tracking')` (World scope - GM controls)

### Visibility Rules
- **GM**: Sees all tracking notifications (when GM tracking is enabled)
- **Players**: No chat notifications - messages only appear in their agent interfaces
- **Privacy**: GM tracking uses FoundryVTT's whisper system for GM-only visibility
- **Settings Scope**: 
  - GM tracking is world-wide (GM controls for all players)

## Integration Points

### 1. SocketLib Integration
- Real-time message delivery
- Cross-client synchronization
- Offline message queuing

### 2. FoundryVTT Chat Integration
- Native ChatMessage creation
- Proper permission handling
- Stylized chat notifications

### 3. Smart Notification Manager
- Cooldown system to prevent spam
- User preference tracking
- Banner notifications for immediate feedback

## Current Status

### ✅ Implemented Features
- GM message tracking notifications
- Real-time message delivery via SocketLib
- Server-side message persistence
- Permission-based visibility
- Settings-based enable/disable

### 🎯 Current Focus
- **GM Tracking Only**: System focuses on providing GMs with real-time oversight of player communications
- **Player Privacy**: Players interact only through their agent interfaces without chat notifications
- **Simplified Architecture**: Removed complex player notification system for better reliability

## Technical Notes

### Message Storage
- Messages stored in `this.messages` Map structure
- Server-side persistence via `saveMessageToServer()`
- Real-time updates via SocketLib

### Performance Considerations
- Debounced saves via `CyberpunkAgentPerformanceManager`
- Cooldown system for notifications
- Efficient message deduplication

### Error Handling
- Graceful fallback when SocketLib unavailable
- Server storage for offline users
- Comprehensive error logging

## Future Development

To implement the chat preview notification feature, the following would need to be added:

1. **Template rendering system** for notification cards
2. **Event listener setup** for interactive buttons
3. **CSS styling** for cyberpunk-themed notifications
4. **Permission checking** for notification visibility
5. **Integration** with existing mute and contact systems

The foundation is already in place with the current tracking notification system, making this enhancement feasible for future development.
