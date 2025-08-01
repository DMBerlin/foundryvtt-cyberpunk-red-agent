# Contact Info System

## Overview

The Contact Info System provides detailed information about contacts in the Cyberpunk Agent module. When users right-click on a contact in the contact list and select "Informações do Contato" (Contact Information), a comprehensive dialog displays various details about the contact and their conversation history.

## Features

### 1. Basic Information Section
- **Name**: The contact's device name
- **Phone Number**: Formatted phone number (e.g., +1 (123) 456-7890)
- **Status**: Whether the contact is muted or active, with visual indicators

### 2. Message Statistics Section
- **Total Messages**: Complete count of all messages in the conversation
- **Sent Messages**: Number of messages sent by the current user
- **Received Messages**: Number of messages received from the contact
- **Unread Messages**: Current count of unread messages (highlighted in red if > 0)

### 3. History Section
- **First Message**: Date and time of the first message in the conversation (serves as a proxy for when the contact was added)
- **Last Message**: Date and time of the most recent message

## Implementation Details

### Access Method
The contact info is accessed through the context menu:
1. Right-click on any contact in the contact list
2. Select "Informações do Contato" from the context menu
3. A dialog appears with comprehensive contact information

### Data Sources
- **Contact Data**: Retrieved from the device registry (`window.CyberpunkAgent.instance.devices`)
- **Phone Numbers**: Generated and formatted using the phone number system
- **Messages**: Retrieved from the conversation history (`getMessagesForDeviceConversation`)
- **Unread Count**: Calculated using the unread count system
- **Mute Status**: Retrieved from the mute system

### Error Handling
The system includes comprehensive error handling:
- Validates that the CyberpunkAgent system is available
- Checks if the contact device exists
- Handles missing or corrupted data gracefully
- Shows user-friendly error messages

## Technical Implementation

### Method Signature
```javascript
async _showContactInfo(contactId)
```

### Key Functions Used
- `getDevicePhoneNumber(contactId)` - Retrieves the contact's phone number
- `formatPhoneNumberForDisplay(phoneNumber)` - Formats the phone number for display
- `getMessagesForDeviceConversation(deviceId, contactId)` - Gets conversation messages
- `getUnreadCountForDevices(deviceId, contactId)` - Gets unread message count
- `isContactMutedForDevice(deviceId, contactId)` - Checks mute status

### Message Statistics Calculation
```javascript
const totalMessages = messages.length;
const sentMessages = messages.filter(msg => msg.senderId === this.device.id).length;
const receivedMessages = messages.filter(msg => msg.receiverId === this.device.id).length;
```

### Date Formatting
Dates are formatted using Brazilian Portuguese locale:
```javascript
new Date(timestamp).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
```

## UI Design

### Dialog Structure
The contact info dialog is organized into three main sections:
1. **Basic Information** - Contact details and status
2. **Message Statistics** - Conversation metrics
3. **History** - Timeline information

### Visual Design
- Uses the cyberpunk theme with dark backgrounds and neon accents
- Icons for each section (user, comments, clock)
- Color-coded status indicators (green for active, red for muted/unread)
- Responsive layout that works on different screen sizes

### CSS Classes
- `.cp-contact-info-dialog` - Main dialog container
- `.cp-contact-info-section` - Individual information sections
- Status indicators with color coding

## Limitations and Considerations

### "Added Date" Limitation
Since the system doesn't currently store when contacts were added, the "First Message" date serves as a proxy for when the contact relationship began. This provides a reasonable approximation of when the contact was first contacted.

### Performance Considerations
- Message statistics are calculated on-demand
- Large conversation histories may impact performance
- Phone number generation is cached for efficiency

### Data Accuracy
- Message counts are based on the current conversation history
- If messages are deleted, statistics will reflect the current state
- Unread counts are real-time and accurate

## Future Enhancements

### Potential Improvements
1. **Contact Added Date**: Store actual contact addition timestamps
2. **Contact Categories**: Add support for contact categorization
3. **Contact Notes**: Allow users to add personal notes about contacts
4. **Contact Photos**: Support for custom contact avatars
5. **Export Functionality**: Allow exporting contact information

### Data Storage
To implement true "added date" functionality, the contact system could be enhanced to store metadata:
```javascript
{
  id: contactId,
  addedDate: timestamp,
  notes: "User notes",
  category: "friend|work|family"
}
```

## Testing

The contact info system includes comprehensive testing:
- Unit tests for data calculation
- Mock testing for dialog rendering
- Error handling validation
- Performance testing for large datasets

### Test File
See `__tests__/test-contact-info.js` for the complete test suite.

## Usage Examples

### Basic Usage
```javascript
// Show contact info for a specific contact
await agentApp._showContactInfo('contact-device-id');
```

### Error Handling
```javascript
try {
  await agentApp._showContactInfo(contactId);
} catch (error) {
  console.error('Failed to show contact info:', error);
  ui.notifications.error('Erro ao carregar informações do contato');
}
```

## Integration

The contact info system integrates seamlessly with:
- **Context Menu System**: Triggered from contact context menus
- **Device System**: Uses device registry for contact data
- **Message System**: Accesses conversation history
- **Phone Number System**: Retrieves and formats phone numbers
- **Mute System**: Checks contact mute status
- **UI Controller**: Updates when contact data changes 