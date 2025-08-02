# Context Menu Ownership Restriction with GM Access

## Overview

The Cyberpunk Agent module now implements a security feature that restricts context menu access based on message ownership and user role:

- **Regular Players**: Can only access the context menu on messages they sent
- **Game Masters (GM)**: Can access the context menu on all messages (both sent and received)

This prevents regular players from accidentally or intentionally deleting messages they did not send, while giving GMs full administrative control over all messages.

## Feature Details

### What is Restricted

- **Context Menu Access**: Regular players can only right-click on their own messages to access the context menu
- **Message Deletion**: Only message owners (or GMs) can delete messages
- **Message Information**: Only message owners (or GMs) can view detailed message information
- **Text Copying**: Only message owners (or GMs) can copy message text via context menu

### GM Privileges

- **Full Access**: GMs can access context menu on all messages
- **Administrative Control**: GMs can delete any message in the conversation
- **Moderation Tools**: GMs can manage message content across all users

### What is Still Allowed

- **Reading Messages**: Users can still read all messages in conversations
- **Sending Messages**: Users can still send new messages normally
- **Contact Management**: Context menus for contacts remain unaffected

## Implementation

### JavaScript Changes

The context menu handler in `scripts/agent-home.js` now includes ownership verification:

```javascript
_onMessageContextMenu(event) {
  event.preventDefault();

  const messageId = event.currentTarget.dataset.messageId;
  const messageText = event.currentTarget.dataset.messageText;
  const messageTime = event.currentTarget.dataset.messageTime;
  const messageElement = event.currentTarget;

  // Check if this message belongs to the current user (isOwn)
  const isOwnMessage = messageElement.classList.contains('own');
  
  // GM can access context menu on all messages, players only on their own messages
  if (!game.user.isGM && !isOwnMessage) {
    console.log("Cyberpunk Agent | Context menu blocked: User does not own this message and is not GM");
    ui.notifications.warn("Você só pode acessar o menu de contexto das suas próprias mensagens.");
    return;
  }

  this._showMessageContextMenu(event, messageId, messageText, messageTime);
}
```

### CSS Changes

The styling in `styles/module.css` has been updated to:

1. **Only show context menu cursor for own messages**:
   ```css
   .cp-message.own[data-action="message-context-menu"] {
     cursor: context-menu !important;
   }
   ```

2. **Disable context menu for other users' messages**:
   ```css
   .cp-message.other[data-action="message-context-menu"] {
     cursor: default !important;
   }
   ```

3. **Add visual indicator for interactive messages**:
   ```css
   .cp-message.own[data-action="message-context-menu"]::before {
     content: '⋮' !important;
     /* Shows menu indicator on hover */
   }
   ```

## User Experience

### Visual Feedback

- **Own Messages**: Show context menu cursor and hover effects
- **Other Messages**: Show default cursor, no hover effects
- **Menu Indicator**: Subtle "⋮" symbol appears on hover for own messages
- **Notification**: Warning message if user tries to access context menu on other's message

### Behavior

1. **Right-click on own message**: Context menu opens normally
2. **Right-click on other's message (non-GM)**: Warning notification appears, no menu
3. **Right-click on other's message (GM)**: Context menu opens normally
4. **Hover over own message**: Visual feedback shows interactivity
5. **Hover over other's message**: No visual feedback (for non-GMs)

## Security Benefits

### Message Integrity

- **Prevents Accidental Deletion**: Users cannot accidentally delete messages they didn't send
- **Maintains Conversation History**: Important messages from other users remain intact
- **Reduces User Errors**: Clear visual feedback prevents confusion

### Privacy Protection

- **Respects Message Ownership**: Each user maintains control over their own messages
- **Prevents Unauthorized Actions**: No unauthorized deletion or modification of others' messages
- **Clear Boundaries**: Users understand what they can and cannot do

## Technical Implementation

### Message Ownership Detection

Messages are marked as "own" or "other" based on the `senderId` field:

```javascript
// In module.js - getMessagesForConversation()
return conversation.map(message => ({
  ...message,
  isOwn: message.senderId === actorId1
}));
```

### CSS Class Application

The template automatically applies the correct CSS class:

```html
<!-- In chat-conversation.html -->
<div class="cp-message {{#if this.isOwn}}own{{else}}other{{/if}}" 
     data-action="message-context-menu">
```

## Testing

A comprehensive test suite is available in `__tests__/test-context-menu-ownership.js` that verifies:

- Context menu access for own messages (both GM and non-GM)
- Context menu blocking for other messages (non-GM only)
- Context menu access for other messages (GM only)
- Proper visual feedback
- Correct ownership detection
- GM privilege verification

## Future Enhancements

### Potential Improvements

1. **Message Editing**: Allow users to edit their own messages
2. **Bulk Operations**: Allow users to delete multiple of their own messages
3. **Audit Trail**: Log all message deletions for moderation
4. **Role-based Permissions**: Allow custom permission levels for different user roles

### Configuration Options

Future versions may include:

- Toggle to enable/disable ownership restrictions
- Different permission levels for different user roles
- Customizable warning messages
- Time-based restrictions (e.g., can't delete messages older than X hours)

## Troubleshooting

### Common Issues

1. **Context menu not appearing on own messages**:
   - Check if the message has the `own` CSS class
   - Verify the `data-action="message-context-menu"` attribute is present

2. **Context menu appearing on other users' messages**:
   - Ensure the ownership check is working correctly
   - Check browser console for JavaScript errors

3. **Visual feedback not working**:
   - Verify CSS is loading properly
   - Check for CSS conflicts with other modules

### Debug Information

Enable debug logging by checking the browser console for:
- "Context menu blocked: User does not own this message"
- "Context menu allowed: User owns this message"
- Message ownership verification logs 