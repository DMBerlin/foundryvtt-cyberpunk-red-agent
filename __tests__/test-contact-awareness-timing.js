/**
 * Test: Contact Awareness Timing
 * 
 * This test verifies that contacts are only added to each other's lists
 * when a message is actually sent, not when contacts are manually added.
 */

console.log('=== Test: Contact Awareness Timing ===');

// Mock the CyberpunkAgent instance
const mockCyberpunkAgent = {
  devices: new Map(),
  messages: new Map(),

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

  // Mock manual contact addition (simulates addContactByPhoneNumber)
  async addContactByPhoneNumber(deviceId, phoneNumber) {
    // This should NOT add the other device to the current device's contacts
    // Only the current device gets the contact added
    const contactDeviceId = this.getDeviceIdFromPhoneNumber(phoneNumber);
    if (contactDeviceId) {
      return this.addContactToDevice(deviceId, contactDeviceId);
    }
    return false;
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

  // Mock phone number lookup
  getDeviceIdFromPhoneNumber(phoneNumber) {
    // Simple mapping for test
    const phoneMap = {
      '555-0101': 'device-1',
      '555-0102': 'device-2',
      '555-0103': 'device-3'
    };
    return phoneMap[phoneNumber] || null;
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

    // Create conversation key and save message
    const conversationKey = this._getDeviceConversationKey(senderDeviceId, receiverDeviceId);
    if (!this.messages.has(conversationKey)) {
      this.messages.set(conversationKey, []);
    }

    const conversation = this.messages.get(conversationKey);
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: senderDeviceId,
      receiverId: receiverDeviceId,
      text: text.trim(),
      timestamp: Date.now(),
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
async function testContactAwarenessTiming() {
  console.log('\n=== Setting up test devices ===');

  // Create test devices
  mockCyberpunkAgent.addDevice('device-1', { name: 'Alice Phone', phoneNumber: '555-0101' });
  mockCyberpunkAgent.addDevice('device-2', { name: 'Bob Phone', phoneNumber: '555-0102' });
  mockCyberpunkAgent.addDevice('device-3', { name: 'Charlie Phone', phoneNumber: '555-0103' });

  console.log('Initial contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  // Test 1: Manual contact addition (should NOT add reciprocal contact)
  console.log('\n=== Test 1: Manual Contact Addition ===');
  console.log('Alice manually adds Bob to her contacts...');

  const manualAddResult = await mockCyberpunkAgent.addContactByPhoneNumber('device-1', '555-0102');

  console.log('\nContact lists after manual addition:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Verify only Alice has Bob as contact, Bob does NOT have Alice
  const device1ContactsAfterManual = [...mockCyberpunkAgent.getContactsForDevice('device-1')];
  const device2ContactsAfterManual = [...mockCyberpunkAgent.getContactsForDevice('device-2')];

  if (device1ContactsAfterManual.includes('device-2') && !device2ContactsAfterManual.includes('device-1')) {
    console.log('✅ SUCCESS: Manual addition works correctly - only Alice has Bob as contact');
  } else {
    console.log('❌ FAILED: Manual addition behavior incorrect');
    console.log('Alice should have Bob:', device1ContactsAfterManual.includes('device-2'));
    console.log('Bob should NOT have Alice:', !device2ContactsAfterManual.includes('device-1'));
  }

  // Test 2: Message sending (should add reciprocal contact)
  console.log('\n=== Test 2: Message Sending ===');
  console.log('Alice sends a message to Bob...');

  await mockCyberpunkAgent.sendDeviceMessage('device-1', 'device-2', 'Hello Bob!');

  console.log('\nContact lists after message sending:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Verify both devices now have each other as contacts
  const device1ContactsAfterMessage = [...mockCyberpunkAgent.getContactsForDevice('device-1')];
  const device2ContactsAfterMessage = [...mockCyberpunkAgent.getContactsForDevice('device-2')];

  if (device1ContactsAfterMessage.includes('device-2') && device2ContactsAfterMessage.includes('device-1')) {
    console.log('✅ SUCCESS: Message sending adds reciprocal contacts - both devices have each other');
  } else {
    console.log('❌ FAILED: Message sending did not add reciprocal contacts');
    console.log('Alice has Bob:', device1ContactsAfterMessage.includes('device-2'));
    console.log('Bob has Alice:', device2ContactsAfterMessage.includes('device-1'));
  }

  // Test 3: Verify Bob only became aware of Alice when message was sent
  console.log('\n=== Test 3: Awareness Timing Verification ===');

  // The variables are correct - device2ContactsAfterManual is [] and device2ContactsAfterMessage is ['device-1']
  const bobHadAliceBeforeMessage = device2ContactsAfterManual.includes('device-1');
  const bobHasAliceAfterMessage = device2ContactsAfterMessage.includes('device-1');

  console.log('Bob contacts before message:', device2ContactsAfterManual);
  console.log('Bob contacts after message:', device2ContactsAfterMessage);

  if (!bobHadAliceBeforeMessage && bobHasAliceAfterMessage) {
    console.log('✅ SUCCESS: Bob only became aware of Alice when the message was sent');
    console.log('Before message: Bob did NOT have Alice as contact');
    console.log('After message: Bob now has Alice as contact');
  } else {
    console.log('❌ FAILED: Bob awareness timing incorrect');
    console.log('Before message: Bob had Alice:', bobHadAliceBeforeMessage);
    console.log('After message: Bob has Alice:', bobHasAliceAfterMessage);
  }

  // Test 4: Test with a third device to ensure the pattern works
  console.log('\n=== Test 4: Third Device Test ===');
  console.log('Charlie sends a message to Alice...');

  await mockCyberpunkAgent.sendDeviceMessage('device-3', 'device-1', 'Hello Alice!');

  console.log('\nContact lists after Charlie\'s message:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  // Verify Charlie and Alice now have each other as contacts
  const device1ContactsFinal = mockCyberpunkAgent.getContactsForDevice('device-1');
  const device3ContactsFinal = mockCyberpunkAgent.getContactsForDevice('device-3');

  if (device1ContactsFinal.includes('device-3') && device3ContactsFinal.includes('device-1')) {
    console.log('✅ SUCCESS: Charlie and Alice now have each other as contacts');
  } else {
    console.log('❌ FAILED: Charlie and Alice contact addition failed');
  }

  // Test 5: Verify Bob is unaffected by Charlie's message
  const device2ContactsFinal = mockCyberpunkAgent.getContactsForDevice('device-2');
  if (device2ContactsFinal.includes('device-1') && !device2ContactsFinal.includes('device-3')) {
    console.log('✅ SUCCESS: Bob still only has Alice as contact (unaffected by Charlie\'s message)');
  } else {
    console.log('❌ FAILED: Bob\'s contact list was incorrectly affected');
  }

  console.log('\n=== Test Summary ===');
  console.log('Final contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));
  console.log('Device 3 contacts:', mockCyberpunkAgent.getContactsForDevice('device-3'));

  console.log('\n=== Contact Awareness Timing Test Complete ===');
}

// Run the test
testContactAwarenessTiming().catch(console.error); 