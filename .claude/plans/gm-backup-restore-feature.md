# GM Backup/Restore Feature Implementation

## Overview

Add two new buttons to the GM Data Management menu:

1. **Export Backup**: Dump all agent data to a JSON file
2. **Import Backup**: Restore data from a JSON file and sync to all players

## Data Structure

### Settings to Backup (World-scoped)

All world-scoped settings need to be exported/imported:

- `device-data` - Device registry and mappings
- `phone-number-data` - Phone number mappings
- `contact-networks` - Contact lists per device
- `server-messages` - All chat messages
- `server-read-status` - Read status per user
- `deletion-records` - Deleted message IDs (30-day retention)
- `zmail-data` - ZMail messages and settings
- `memo-data` - Memo notes per device
- `gm-pinned-devices` - GM pinned devices list
- `offline-message-queue` - Offline message queue

### Export JSON Structure

```json
{
  "version": "2.0.0",
  "exportDate": "2026-01-31T12:00:00.000Z",
  "worldName": "My Cyberpunk World",
  "foundryVersion": "12.0.0",
  "data": {
    "device-data": {...},
    "phone-number-data": {...},
    "contact-networks": {...},
    "server-messages": {...},
    "server-read-status": {...},
    "deletion-records": {...},
    "zmail-data": {...},
    "memo-data": {...},
    "gm-pinned-devices": [...],
    "offline-message-queue": {...}
  }
}
```

## Implementation Details

### 1. Template Updates

**File**: `templates/gm-data-management.html`

- Add new section after "Synchronize All Devices" and before the `<hr>`
- Add two buttons: "Export Backup" and "Import Backup"
- Use consistent styling with existing buttons

### 2. Localization Keys

**File**: `lang/en.json`
Add to `GM_MANAGEMENT` section:

- `EXPORT_BACKUP.TITLE`, `EXPORT_BACKUP.BUTTON`, `EXPORT_BACKUP.HINT`, `EXPORT_BACKUP.SUCCESS`, `EXPORT_BACKUP.ERROR`
- `IMPORT_BACKUP.TITLE`, `IMPORT_BACKUP.BUTTON`, `IMPORT_BACKUP.HINT`, `IMPORT_BACKUP.CONFIRM_TITLE`, `IMPORT_BACKUP.CONFIRM_MESSAGE`, `IMPORT_BACKUP.SUCCESS`, `IMPORT_BACKUP.ERROR`, `IMPORT_BACKUP.INVALID_FILE`, `IMPORT_BACKUP.MERGE_STATS`

### 3. GMDataManagementMenu Class Updates

**File**: `scripts/module.js` (GMDataManagementMenu class)

#### New Methods:

- `_onExportBackup(event)` - Export handler
  - Collect all world-scoped settings
  - Create JSON structure with metadata
  - Use `Blob` + `URL.createObjectURL` + anchor element for download
  - Filename: `cyberpunk-agent-backup-YYYY-MM-DD-HHMMSS.json`
- `_onImportBackup(event)` - Import handler
  - Use `FilePicker.browse()` to select JSON file
  - Parse and validate JSON structure
  - Show confirmation dialog (warns about overwriting current data)
  - Restore all settings using `game.settings.set()`
  - Reload data in CyberpunkAgent instance
  - Broadcast sync event to all players via SocketLib

#### Update `activateListeners()`:

- Add click handlers for new buttons

### 4. CyberpunkAgent Class Updates

**File**: `scripts/module.js` (CyberpunkAgent class)

#### New Methods:

- `exportAllData()` - Collect and structure all data for export
  - Returns JSON object with metadata and all settings
- `importAllData(backupData)` - Restore data from backup (idempotent)
  - Validates backup structure
  - Merges data idempotently (prevents duplicates):
    - **Messages**: Merge by message ID - only add if ID doesn't exist in current data
    - **ZMail**: Merge by message ID - only add if ID doesn't exist
    - **Memos**: Merge by note ID - only add if ID doesn't exist
    - **Devices**: Merge by deviceId - update existing or add new
    - **Contacts**: Merge by deviceId+contactId - update existing or add new
    - **Phone Numbers**: Merge by phoneNumber - update existing or add new
    - **Read Status**: Merge by conversationKey+userId - keep most recent timestamp
    - **Deletion Records**: Merge by messageId - keep union of deleted IDs
    - **GM Pinned Devices**: Merge arrays - keep union of device IDs
    - **Offline Queue**: Merge by userId - combine queues
  - Sets all world-scoped settings with merged data
  - Reloads internal data structures
  - Returns success/error status with merge statistics
- `_broadcastDataRestore()` - Notify all players of data restore
  - Uses SocketLib `broadcastToAll()` with event `dataRestored`
  - Triggers client-side data reload

### 5. SocketLib Integration

**File**: `scripts/socketlib-integration.js`

#### New Handler:

- `handleDataRestore(data)` - Client-side handler for restore notification
  - Reloads device data, messages, contacts, etc.
  - Updates UI components
  - Shows notification to players

#### Update `initializeSocketLib()`:

- Register `dataRestored` handler

### 6. File Operations

#### Export (Browser Download):

```javascript
const jsonString = JSON.stringify(backupData, null, 2);
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `cyberpunk-agent-backup-${timestamp}.json`;
a.click();
URL.revokeObjectURL(url);
```

#### Import (FilePicker):

```javascript
const file = await FilePicker.browse('data', {
  type: 'json',
  wildcard: true,
});
// Read file content and parse JSON
```

## Data Flow

### Export Flow

```
GM clicks Export → Collect all settings → Create JSON → Download file
```

### Import Flow

```
GM clicks Import → Select file → Parse JSON → Validate → Confirm →
Merge data idempotently (by ID) → Restore settings → Reload instance data →
Broadcast to players → Players reload their data → Success notification
```

## Error Handling

- **Export errors**: Catch and show notification, log to console
- **Import errors**:
  - Invalid file format → Show error notification
  - Missing required fields → Show error notification
  - Parse errors → Show error notification
  - Setting save failures → Rollback if possible, show error

## Validation

### Export Validation:

- Verify all settings exist before export
- Check data integrity

### Import Validation:

- Verify JSON structure
- Check version compatibility (warn if different)
- Validate required fields exist
- Check data types match expected structure

### Idempotent Merge Strategy:

#### Messages (`server-messages`):

- Structure: `{conversationKey: [messages]}`
- Merge logic: For each conversationKey, merge message arrays by message ID
  - Create Set of existing message IDs
  - Only add messages from backup that don't exist in Set
  - Preserve message order (existing messages first, then new ones by timestamp)

#### ZMail (`zmail-data.messages`):

- Structure: `{deviceId: [zmailMessages]}`
- Merge logic: For each deviceId, merge arrays by message ID
  - Check if message.id exists in current data
  - Only add if ID doesn't exist

#### Memos (`memo-data`):

- Structure: `{deviceId: [memoNotes]}`
- Merge logic: For each deviceId, merge arrays by note ID
  - Check if note.id exists in current data
  - Only add if ID doesn't exist

#### Devices (`device-data.devices`):

- Structure: `{deviceId: deviceObject}`
- Merge logic: Update existing devices or add new ones
  - If deviceId exists: merge properties (prefer backup data for conflicts)
  - If deviceId doesn't exist: add new device

#### Contacts (`contact-networks`):

- Structure: `{deviceId: [contactDeviceIds]}`
- Merge logic: Merge contact arrays per device
  - Create Set of existing contacts for deviceId
  - Add contacts from backup that don't exist in Set
  - Keep union of both arrays

#### Phone Numbers (`phone-number-data`):

- Structure: `{phoneNumberDictionary: {phoneNumber: deviceId}, devicePhoneNumbers: {deviceId: phoneNumber}}`
- Merge logic: Update existing mappings or add new ones
  - For phoneNumberDictionary: Update if phoneNumber exists, add if new
  - For devicePhoneNumbers: Update if deviceId exists, add if new

#### Read Status (`server-read-status`):

- Structure: `{conversationKey: {userId: {lastReadTimestamp, readMessages}}}`
- Merge logic: Keep most recent timestamp per conversationKey+userId
  - Compare timestamps, keep the newer one
  - Merge readMessages arrays (union of message IDs)

#### Deletion Records (`deletion-records`):

- Structure: `{messageId: {deletedAt, deletedBy}}`
- Merge logic: Union of deleted message IDs
  - Add all deletion records from backup
  - Keep existing records (don't overwrite)

#### GM Pinned Devices (`gm-pinned-devices`):

- Structure: `[deviceId1, deviceId2, ...]`
- Merge logic: Union of device IDs
  - Create Set from both arrays
  - Convert back to array (preserves uniqueness)

#### Offline Message Queue (`offline-message-queue`):

- Structure: `{userId: [queuedMessages]}`
- Merge logic: Combine queues per userId
  - Concatenate arrays for each userId
  - Remove duplicates by message ID if present

## User Experience

### Export:

- Instant download, no confirmation needed
- Success notification with file name
- Error notification if export fails

### Import:

- File picker dialog
- Confirmation dialog explaining idempotent merge (won't duplicate existing data)
- Progress indication during restore
- Success notification with merge statistics (e.g., "Added 50 new messages, 10 new ZMails, merged 200 existing messages")
- Error notification with details if restore fails

## Testing Considerations

- Test with empty data (new world)
- Test with large datasets (many messages/devices)
- Test import of older backup format (version compatibility)
- Test with missing fields (graceful degradation)
- Test SocketLib broadcast to multiple clients
- Test error scenarios (corrupted file, invalid JSON)
- **Test idempotency**: Import same backup twice - verify no duplicates
- **Test merge scenarios**:
  - Import backup with overlapping messages - verify no duplicates
  - Import backup with new messages - verify new messages added
  - Import backup with same ZMail - verify no duplicate ZMails
  - Import backup with same memos - verify no duplicate memos
  - Import backup with partial data - verify existing data preserved

## Files to Modify

1. `templates/gm-data-management.html` - Add UI buttons
2. `lang/en.json` - Add localization keys
3. `scripts/module.js` - Add export/import methods to GMDataManagementMenu and CyberpunkAgent classes
4. `scripts/socketlib-integration.js` - Add data restore handler
5. `lang/pt-BR.json` - Add Portuguese translations (if needed)

## Security Considerations

- Only GM can access export/import functions (already restricted)
- Validate all imported data before applying
- Sanitize file names to prevent path traversal
- Limit file size for imports (prevent DoS)

## Idempotency Guarantees

The import process is designed to be **idempotent** - importing the same backup multiple times or importing into a world with existing data will:

- **Never duplicate messages** - Messages are merged by unique message ID
- **Never duplicate ZMails** - ZMails are merged by unique message ID
- **Never duplicate memos** - Memos are merged by unique note ID
- **Preserve existing data** - Existing messages/mails/notes are never deleted or overwritten
- **Add only new data** - Only adds data that doesn't already exist
- **Merge intelligently** - Combines data structures (contacts, devices) without duplicates

This ensures that:

- Importing a backup twice results in the same state
- Importing into a world with existing data doesn't corrupt or duplicate content
- Players can safely import backups without losing their current data
