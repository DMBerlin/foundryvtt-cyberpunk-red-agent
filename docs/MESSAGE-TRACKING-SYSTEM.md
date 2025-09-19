# Message Tracking System - Cyberpunk Agent

## Overview

The Message Tracking System provides GMs and players with real-time notifications about message exchanges in the Cyberpunk Agent system. This feature enhances communication oversight and provides better visibility into player interactions.

## Features

### GM Message Tracking
- **Real-time notifications** for all message exchanges between players
- **Stylized chat messages** showing sender → receiver and message content
- **Configurable setting** to enable/disable tracking
- **Whisper-only visibility** to GMs only

### Player Message Notifications
- **Preview notifications** for incoming messages
- **Visible to involved parties** (sender and receiver)
- **Message preview** with truncated content for longer messages
- **Configurable setting** to enable/disable player notifications

## Settings

### GM Settings (World Scope)
- **GM Message Tracking**: Enable/disable GM notifications for all message exchanges
  - Default: `true`
  - Scope: World (affects all players)
  - Location: Module Settings → GM Message Tracking

### Player Settings (World Scope)
- **Player Message Notifications**: Enable/disable chat notifications for players
  - Default: `true`
  - Scope: World (affects all players)
  - Location: Module Settings → Player Message Notifications

## Technical Implementation

### Message Flow
```
Player A sends message → Cyberpunk Agent System → Message Processing
                                                      ↓
                                              Tracking Notifications
                                                      ↓
                                    GM Notification (if enabled)
                                                      ↓
                                    Player Notifications (if enabled)
```

### Notification Types

#### GM Tracking Notification
- **Visibility**: Whispered to all GMs only
- **Content**: Full message content with sender/receiver information
- **Styling**: Prominent cyberpunk-themed design with glow effects
- **Purpose**: Complete oversight of all communications

#### Player Notification
- **Visibility**: Whispered to sender and receiver only
- **Content**: Message preview (truncated if > 100 characters)
- **Styling**: Subtle notification design
- **Purpose**: Quick preview of message exchanges

### CSS Classes
- `.cyberpunk-agent-tracking-notification` - GM tracking notifications
- `.cyberpunk-agent-player-notification` - Player notifications
- `.tracking-header`, `.tracking-route`, `.tracking-content` - GM notification elements
- `.notification-header`, `.notification-route`, `.notification-preview` - Player notification elements

## Usage

### For GMs
1. Navigate to **Module Settings** → **Cyberpunk Agent**
2. Toggle **GM Message Tracking** on/off
3. When enabled, all message exchanges will appear as styled notifications in chat
4. Notifications show:
   - Timestamp
   - Sender → Receiver route
   - Full message content

### For Players
1. Navigate to **Module Settings** → **Cyberpunk Agent**
2. Toggle **Player Message Notifications** on/off
3. When enabled, message exchanges will show preview notifications
4. Notifications show:
   - Timestamp
   - Sender → Receiver route
   - Message preview (truncated if long)

## Message Structure

### GM Tracking Notification
```html
<div class="cyberpunk-agent-tracking-notification">
    <div class="tracking-header">
        <i class="fas fa-exchange-alt"></i>
        <strong>New Message Exchange</strong>
        <span class="tracking-time">[timestamp]</span>
    </div>
    <div class="tracking-route">
        <span class="sender">[Sender Name]</span>
        <i class="fas fa-arrow-right"></i>
        <span class="receiver">[Receiver Name]</span>
    </div>
    <div class="tracking-content">
        <strong>Message:</strong> [Full Message Content]
    </div>
</div>
```

### Player Notification
```html
<div class="cyberpunk-agent-player-notification">
    <div class="notification-header">
        <i class="fas fa-mobile-alt"></i>
        <strong>New Message</strong>
        <span class="notification-time">[timestamp]</span>
    </div>
    <div class="notification-route">
        <span class="sender">[Sender Name]</span>
        <i class="fas fa-arrow-right"></i>
        <span class="receiver">[Receiver Name]</span>
    </div>
    <div class="notification-preview">
        <strong>Message:</strong> [Message Preview - truncated if > 100 chars]
    </div>
</div>
```

## Integration Points

### Core Methods
- `_sendMessageTrackingNotifications()` - Main tracking coordinator
- `_sendGMTrackingNotification()` - GM notification sender
- `_sendPlayerNotification()` - Player notification sender
- `_getActorForDevice()` - Device to actor mapping

### Integration with Existing System
- Hooks into `sendDeviceMessage()` method
- Uses existing `ChatMessage.create()` for FoundryVTT integration
- Leverages current device/actor mapping system
- Respects existing permission system

## Privacy Considerations

### GM Notifications
- **Visibility**: Only visible to GMs
- **Content**: Full message content for complete oversight
- **Purpose**: Administrative monitoring and game management

### Player Notifications
- **Visibility**: Only visible to involved parties (sender/receiver)
- **Content**: Preview only (truncated for privacy)
- **Purpose**: Quick awareness without full message exposure

## Performance Considerations

- Notifications are sent asynchronously to avoid blocking message delivery
- Error handling prevents notification failures from affecting core messaging
- CSS animations are lightweight and GPU-accelerated
- Responsive design ensures mobile compatibility

## Troubleshooting

### Notifications Not Appearing
1. Check module settings are enabled
2. Verify user permissions for actor ownership
3. Check browser console for JavaScript errors
4. Ensure FoundryVTT chat system is functioning

### Styling Issues
1. Clear browser cache and reload
2. Check for CSS conflicts with other modules
3. Verify cyberpunk-agent CSS is loading properly

### Performance Issues
1. Disable notifications if causing lag
2. Check for excessive message volume
3. Monitor browser performance with developer tools

## Future Enhancements

- **Customizable notification templates**
- **Message filtering by content type**
- **Notification history and archiving**
- **Advanced privacy controls**
- **Integration with other communication modules**
