/**
 * Test: Auto Contact Addition on Message Send
 * 
 * This test verifies that when a device sends a message to another device
 * that isn't in their contact list, both devices automatically add each other
 * to their contact lists.
 */

console.log('=== Test: Auto Contact Addition on Message Send ===');

// Mock the CyberpunkAgent instance
const mockCyberpunkAgent = {
  devices: new Map(),
  messages: new Map(),
  unreadCounts: new Map(),

  // Mock device data
  addDevice(deviceId, deviceData) {
    this.devices.set(deviceId, {
      id: deviceId,
      contacts: [],
      ...deviceData
    });
  },

  // Mock contact checking
  isDeviceContact(deviceId, contactDeviceId) {
    const device = this.devices.get(deviceId);
    return device && device.contacts && device.contacts.includes(contactDeviceId);
  },

  // Mock contact addition
  async addContactToDevice(deviceId, contactDeviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      console.error(`Device ${deviceId} not found`);
      return false;
    }

    if (!device.contacts) {
      device.contacts = [];
    }

    if (!device.contacts.includes(contactDeviceId)) {
      device.contacts.push(contactDeviceId);
      console.log(`Added contact ${contactDeviceId} to device ${deviceId}`);
      return true;
    }

    return false;
  },

  // Mock message sending with auto contact addition
  async sendDeviceMessage(senderDeviceId, receiverDeviceId, text) {
    if (!text || !text.trim()) {
      return false;
    }

    console.log(`\n--- Sending message from ${senderDeviceId} to ${receiverDeviceId} ---`);
    console.log(`Message: "${text}"`);

    // Check if receiver is in sender's contacts, if not, add them
    if (!this.isDeviceContact(senderDeviceId, receiverDeviceId)) {
      console.log(`Adding ${receiverDeviceId} to ${senderDeviceId} contacts automatically`);
      await this.addContactToDevice(senderDeviceId, receiverDeviceId);
    }

    // Check if sender is in receiver's contacts, if not, add them
    if (!this.isDeviceContact(receiverDeviceId, senderDeviceId)) {
      console.log(`Adding ${senderDeviceId} to ${receiverDeviceId} contacts automatically`);
      await this.addContactToDevice(receiverDeviceId, senderDeviceId);
    }

    // Create conversation key
    const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);

    if (!this.messages.has(conversationKey)) {
      this.messages.set(conversationKey, []);
    }

    const conversation = this.messages.get(conversationKey);
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      senderId: senderDeviceId,
      receiverId: receiverDeviceId,
      text: text.trim(),
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };

    conversation.push(message);
    console.log(`Message saved to conversation: ${conversationKey}`);

    return true;
  },

  // Mock conversation key generation
  _getDeviceConversationKey(deviceId1, deviceId2) {
    const sortedIds = [deviceId1, deviceId2].sort();
    return `device-${sortedIds[0]}-${sortedIds[1]}`;
  },

  // Mock contact retrieval
  getContactsForDevice(deviceId) {
    const device = this.devices.get(deviceId);
    return device ? device.contacts || [] : [];
  }
};

// Test function
async function testAutoContactAddition() {
  console.log('\n=== Setting up test devices ===');

  // Create test devices
  mockCyberpunkAgent.addDevice('device-1', { name: 'Alice Phone', phoneNumber: '555-0101' });
  mockCyberpunkAgent.addDevice('device-2', { name: 'Bob Phone', phoneNumber: '555-0102' });
  mockCyberpunkAgent.addDevice('device-3', { name: 'Charlie Phone', phoneNumber: '555-0103' });

  console.log('Initial contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  // Test 1: Send message between devices that don't have each other as contacts
  console.log('\n=== Test 1: First message between devices ===');
  await mockCyberpunkAgent.sendDeviceMessage('device-1', 'device-2', 'Hello Bob!');

  console.log('\nContact lists after first message:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Verify both devices now have each other as contacts
  const device1Contacts = mockCyberpunkAgent.getContactsForDevice('device-1');
  const device2Contacts = mockCyberpunkAgent.getContactsForDevice('device-2');

  if (device1Contacts.includes('device-2') && device2Contacts.includes('device-1')) {
    console.log('✅ SUCCESS: Both devices automatically added each other as contacts');
  } else {
    console.log('❌ FAILED: Devices did not automatically add each other as contacts');
    console.log('Device 1 should have device-2 in contacts:', device1Contacts.includes('device-2'));
    console.log('Device 2 should have device-1 in contacts:', device2Contacts.includes('device-1'));
  }

  // Test 2: Send another message (should not add contacts again)
  console.log('\n=== Test 2: Second message between same devices ===');
  await mockCyberpunkAgent.sendDeviceMessage('device-2', 'device-1', 'Hi Alice!');

  console.log('\nContact lists after second message:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Test 3: Send message to a third device
  console.log('\n=== Test 3: Message to third device ===');
  await mockCyberpunkAgent.sendDeviceMessage('device-1', 'device-3', 'Hello Charlie!');

  console.log('\nContact lists after third message:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  // Verify device 1 and device 3 now have each other as contacts
  const device1ContactsAfter = mockCyberpunkAgent.getContactsForDevice('device-1');
  const device3Contacts = mockCyberpunkAgent.getContactsForDevice('device-3');

  if (device1ContactsAfter.includes('device-3') && device3Contacts.includes('device-1')) {
    console.log('✅ SUCCESS: Device 1 and Device 3 automatically added each other as contacts');
  } else {
    console.log('❌ FAILED: Device 1 and Device 3 did not automatically add each other as contacts');
  }

  // Test 4: Verify device 2 still has device 1 as contact (shouldn't be affected)
  const device2ContactsAfter = mockCyberpunkAgent.getContactsForDevice('device-2');
  if (device2ContactsAfter.includes('device-1')) {
    console.log('✅ SUCCESS: Device 2 still has Device 1 as contact (unchanged)');
  } else {
    console.log('❌ FAILED: Device 2 lost Device 1 as contact');
  }

  // Test 5: Check conversation history
  console.log('\n=== Test 5: Conversation History ===');
  const conversation1 = mockCyberpunkAgent.messages.get('device-device-1-device-2');
  const conversation2 = mockCyberpunkAgent.messages.get('device-device-1-device-3');

  console.log('Conversation 1-2 messages:', conversation1 ? conversation1.length : 0);
  console.log('Conversation 1-3 messages:', conversation2 ? conversation2.length : 0);

  if (conversation1 && conversation1.length === 2) {
    console.log('✅ SUCCESS: Conversation 1-2 has correct number of messages');
  } else {
    console.log('❌ FAILED: Conversation 1-2 has incorrect number of messages');
  }

  if (conversation2 && conversation2.length === 1) {
    console.log('✅ SUCCESS: Conversation 1-3 has correct number of messages');
  } else {
    console.log('❌ FAILED: Conversation 1-3 has incorrect number of messages');
  }

  console.log('\n=== Test Summary ===');
  console.log('Final contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  console.log('\n=== Auto Contact Addition Test Complete ===');
}

// Run the test
testAutoContactAddition().catch(console.error); 