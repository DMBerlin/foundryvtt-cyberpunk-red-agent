# Device Management Settings - Cyberpunk Agent

## Overview

The Cyberpunk Agent module now includes comprehensive device management settings in the Game Settings, allowing GMs to manage all aspects of the device registry and contact system.

## Accessing Device Management Settings

1. **Open Game Settings**: Go to `Game Settings` in FoundryVTT
2. **Navigate to Module Settings**: Find the `Cyberpunk Agent` section
3. **GM Data Management**: Click on the `GM Data Management` button (only visible to GMs)

## Available Management Tools

### 1. Clear All Messages
- **Purpose**: Deletes all chat message histories for all devices in the registry
- **Scope**: Affects all users and all devices
- **Warning**: This action cannot be undone
- **Use Case**: When you want to start fresh with message history

### 2. Clear All Contact Lists
- **Purpose**: Clears the contact list from all agent devices in the registry
- **Scope**: Removes all contacts but keeps the devices themselves
- **Warning**: This action cannot be undone
- **Use Case**: When you want to remove all contacts but keep the device registry intact

### 3. Synchronize All Devices
- **Purpose**: Ensures all devices in the registry have phone numbers attached
- **Scope**: Updates any devices that are missing phone numbers
- **Warning**: This action is safe and can be repeated
- **Use Case**: When devices are missing phone numbers or after adding new devices

## Technical Implementation

### Settings Registration
The module registers several internal settings for data management:

```javascript
// Device data setting
game.settings.register('cyberpunk-agent', 'device-data', {
    name: 'Device Data',
    hint: 'Internal storage for device-based agent system',
    scope: 'world',
    config: false,
    type: Object,
    default: { devices: {}, deviceMappings: {} }
});

// Phone number data setting
game.settings.register('cyberpunk-agent', 'phone-number-data', {
    name: 'Phone Number Data',
    hint: 'Internal storage for phone number mappings',
    scope: 'world',
    config: false,
    type: Object,
    default: { phoneNumberDictionary: {}, devicePhoneNumbers: {} }
});

// Contact networks setting
game.settings.register('cyberpunk-agent', 'contact-networks', {
    name: 'Contact Networks',
    hint: 'Internal storage for contact network data',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
});
```

### GM Data Management Menu
The settings use a custom FormApplication class (`GMDataManagementMenu`) that provides:

- **Confirmation Dialogs**: All destructive actions require confirmation
- **Real-time Updates**: Changes are synchronized across all connected clients
- **Error Handling**: Proper error messages and rollback capabilities
- **Permission Enforcement**: Only GMs can access these tools

### SocketLib Integration
All management actions are synchronized across clients using SocketLib:

- **Broadcast Updates**: Changes are broadcast to all connected clients
- **Cross-client Synchronization**: All clients receive updates in real-time
- **Fallback Handling**: Graceful degradation when SocketLib is unavailable

## Usage Examples

### Scenario 1: Starting a New Campaign
1. Open GM Data Management
2. Click "Clear All Messages" to start with clean message history
3. Click "Clear All Contact Lists" to reset all contact relationships
4. Use "Synchronize All Devices" to ensure all devices have phone numbers

### Scenario 3: Device Registry Issues
1. Open GM Data Management
2. Click "Synchronize All Devices" to fix missing phone numbers
3. Check console for detailed synchronization results

### Scenario 2: Contact List Cleanup
1. Open GM Data Management
2. Click "Clear All Contact Lists" to remove all contacts
3. Players can then rebuild their contact lists as needed

## Safety Features

### Confirmation Dialogs
All destructive actions show confirmation dialogs with:
- Clear description of what will happen
- Warning about irreversible nature
- Option to cancel the operation

### Permission Checks
- Only GMs can access the management tools
- All operations verify GM permissions before execution
- Non-GM users cannot trigger these operations

### Data Validation
- Operations validate data integrity before execution
- Rollback mechanisms for failed operations
- Detailed error logging for troubleshooting

## Troubleshooting

### Common Issues

1. **Settings Not Visible**
   - Ensure you are logged in as a GM
   - Check that the module is properly loaded
   - Verify FoundryVTT version compatibility

2. **Operations Fail**
   - Check browser console for error messages
   - Verify SocketLib is available and working
   - Ensure sufficient permissions for file operations

3. **Changes Not Syncing**
   - Check SocketLib connection status
   - Verify all clients are connected
   - Check for network connectivity issues

### Debug Commands
Use these console commands for debugging:

```javascript
// Check device registry status
window.cyberpunkAgent.getAllRegisteredDevices()

// Check SocketLib status
window.cyberpunkAgent.socketLibIntegration.getConnectionStatus()

// Force device synchronization
window.cyberpunkAgent.synchronizeAllDevices()
```

## Best Practices

1. **Backup Before Major Operations**: Always backup your world data before performing destructive operations
2. **Test in Development**: Test management operations in a development environment first
3. **Communicate with Players**: Inform players before performing operations that affect their data
4. **Monitor Console**: Watch the browser console for detailed operation logs
5. **Use Incrementally**: Consider using smaller operations instead of clearing everything at once

## Future Enhancements

Planned improvements for device management:

- **Selective Operations**: Target specific devices or users
- **Backup/Restore**: Built-in backup and restore functionality
- **Audit Trail**: Log of all management operations
- **Scheduled Operations**: Automate routine maintenance tasks
- **Advanced Filtering**: Filter devices by various criteria 