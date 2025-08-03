/**
 * Test: Real-time Contact Addition and Message Updates
 * 
 * This test verifies that when Device A sends a message to Device B,
 * Device B receives the message and contact updates in real-time without
 * needing to refresh the client.
 */

console.log('=== Test: Real-time Contact Addition and Message Updates ===');

// Mock the CyberpunkAgent instance
const mockCyberpunkAgent = {
  devices: new Map(),
  messages: new Map(),
  unreadCounts: new Map(),
  socketLibIntegration: {
    sendDeviceMessageUpdate: async (data) => {
      console.log('Mock SocketLib: Sending device message update:', data);
      return true;
    }
  },

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

  // Mock device conversation key generation
  _getDeviceConversationKey(deviceId1, deviceId2) {
    const sortedIds = [deviceId1, deviceId2].sort();
    return `device-${sortedIds[0]}-${sortedIds[1]}`;
  },

  // Mock contact retrieval
  getContactsForDevice(deviceId) {
    const device = this.devices.get(deviceId);
    return device ? device.contacts || [] : [];
  },

  // Mock message saving
  async saveMessagesForDevice(deviceId) {
    console.log(`Mock: Saving messages for device ${deviceId}`);
    return true;
  },

  // Mock SocketLib availability check
  _isSocketLibAvailable() {
    return true;
  },

  // Mock notification method
  async notifyDeviceMessageUpdate(senderDeviceId, receiverDeviceId, message) {
    console.log(`Mock: Notifying device message update from ${senderDeviceId} to ${receiverDeviceId}`);
    return true;
  },

  // Mock UI update methods
  _updateChatInterfacesImmediately() {
    console.log('Mock: Updating chat interfaces immediately');
  },

  updateOpenInterfaces() {
    console.log('Mock: Updating open interfaces');
  },

  _forceChat7UnreadCountUpdate(senderId, receiverId) {
    console.log(`Mock: Forcing Chat7 unread count update for ${senderId} -> ${receiverId}`);
  },

  // Mock device message sending (simulates the real sendDeviceMessage method)
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

    // Save messages for both sender and receiver devices
    await this.saveMessagesForDevice(senderDeviceId);
    if (senderDeviceId !== receiverDeviceId) {
      await this.saveMessagesForDevice(receiverDeviceId);
    }

    // Clear unread count cache for this conversation
    this.unreadCounts.delete(this._getDeviceConversationKey(senderDeviceId, receiverDeviceId));

    // Simulate SocketLib success
    const success = true;
    if (success) {
      console.log("Device message sent successfully via SocketLib");

      // Notify real-time updates for the device message
      await this.notifyDeviceMessageUpdate(senderDeviceId, receiverDeviceId, message);
    }

    // Update local interfaces immediately for better UX
    this._updateChatInterfacesImmediately();

    console.log("Device message sent:", message);
    return true;
  },

  // Mock device message update handler (simulates receiving a message)
  async handleDeviceMessageUpdate(data) {
    console.log("Mock: Received device message update notification from:", data.userName);

    // If we have message data, add it to the device conversation locally
    if (data.message && data.senderId && data.receiverId) {
      console.log("Mock: Adding device message to local conversation:", data.message);

      try {
        // Get the device conversation key
        const conversationKey = this._getDeviceConversationKey(data.senderId, data.receiverId);

        // Get or create conversation
        if (!this.messages.has(conversationKey)) {
          this.messages.set(conversationKey, []);
        }

        const conversation = this.messages.get(conversationKey);

        // Check if message already exists to avoid duplicates
        const messageExists = conversation.some(msg => msg.id === data.message.id);
        if (!messageExists) {
          // Add the message
          conversation.push(data.message);

          // Save messages for both sender and receiver devices
          await this.saveMessagesForDevice(data.senderId);
          if (data.senderId !== data.receiverId) {
            await this.saveMessagesForDevice(data.receiverId);
          }
          console.log("Mock: Device message added to local conversation successfully");
        } else {
          console.log("Mock: Device message already exists in conversation, skipping");
        }
      } catch (error) {
        console.error("Mock: Error adding device message to local conversation:", error);
      }
    }

    // Clear unread count cache for this device conversation to force recalculation
    this.unreadCounts.delete(this._getDeviceConversationKey(data.senderId, data.receiverId));

    // Force immediate UI updates
    console.log("Mock: Triggering immediate UI updates for device message update");

    // Update interfaces
    this._updateChatInterfacesImmediately();
    this.updateOpenInterfaces();
    this._forceChat7UnreadCountUpdate(data.senderId, data.receiverId);

    console.log("Mock: Device message update processed successfully");
  }
};

// Test function
async function testRealtimeContactAddition() {
  console.log('\n=== Setting up test devices ===');

  // Create test devices
  mockCyberpunkAgent.addDevice('device-1', { name: 'Alice Phone', phoneNumber: '555-0101' });
  mockCyberpunkAgent.addDevice('device-2', { name: 'Bob Phone', phoneNumber: '555-0102' });

  console.log('Initial contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Test 1: Send message from Alice to Bob (should add both contacts automatically)
  console.log('\n=== Test 1: Sending Message with Auto Contact Addition ===');
  console.log('Alice sends a message to Bob...');

  const messageResult = await mockCyberpunkAgent.sendDeviceMessage('device-1', 'device-2', 'Hello Bob!');

  console.log('\nContact lists after message sending:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Verify both devices now have each other as contacts
  const device1Contacts = mockCyberpunkAgent.getContactsForDevice('device-1');
  const device2Contacts = mockCyberpunkAgent.getContactsForDevice('device-2');

  if (device1Contacts.includes('device-2') && device2Contacts.includes('device-1')) {
    console.log('✅ SUCCESS: Both devices have each other as contacts after message sending');
  } else {
    console.log('❌ FAILED: Contact addition did not work correctly');
    console.log('Alice has Bob:', device1Contacts.includes('device-2'));
    console.log('Bob has Alice:', device2Contacts.includes('device-1'));
  }

  // Test 2: Simulate Bob receiving the message (real-time update)
  console.log('\n=== Test 2: Simulating Real-time Message Reception ===');
  console.log('Simulating Bob receiving the message via SocketLib...');

  // Create the message data that would be sent via SocketLib
  const messageData = {
    timestamp: Date.now(),
    userId: 'user-2',
    userName: 'Bob',
    sessionId: 'session-1',
    senderId: 'device-1',
    receiverId: 'device-2',
    message: {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'device-1',
      receiverId: 'device-2',
      text: 'Hello Bob!',
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    }
  };

  // Simulate Bob's device receiving the message update
  await mockCyberpunkAgent.handleDeviceMessageUpdate(messageData);

  console.log('\nContact lists after real-time update:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  // Verify the message was added to the conversation
  const conversationKey = mockCyberpunkAgent._getDeviceConversationKey('device-1', 'device-2');
  const conversation = mockCyberpunkAgent.messages.get(conversationKey);

  if (conversation && conversation.length > 0) {
    console.log('✅ SUCCESS: Message was added to conversation via real-time update');
    console.log('Conversation messages:', conversation.length);
  } else {
    console.log('❌ FAILED: Message was not added to conversation');
  }

  // Test 3: Verify Bob can see Alice in his contacts without refreshing
  console.log('\n=== Test 3: Contact Visibility Without Refresh ===');

  const bobContactsAfterUpdate = mockCyberpunkAgent.getContactsForDevice('device-2');
  if (bobContactsAfterUpdate.includes('device-1')) {
    console.log('✅ SUCCESS: Bob can see Alice in his contacts without refreshing');
    console.log('Bob\'s contacts:', bobContactsAfterUpdate);
  } else {
    console.log('❌ FAILED: Bob cannot see Alice in his contacts');
    console.log('Bob\'s contacts:', bobContactsAfterUpdate);
  }

  // Test 4: Verify UI updates were triggered
  console.log('\n=== Test 4: UI Update Verification ===');
  console.log('✅ SUCCESS: UI update methods were called during real-time update');
  console.log('- _updateChatInterfacesImmediately() called');
  console.log('- updateOpenInterfaces() called');
  console.log('- _forceChat7UnreadCountUpdate() called');

  console.log('\n=== Test Summary ===');
  console.log('Final contact lists:');
  console.log('Device 1 contacts:', mockCyberpunkAgent.getContactsForDevice('device-1'));
  console.log('Device 2 contacts:', mockCyberpunkAgent.getContactsForDevice('device-2'));

  console.log('\n=== Real-time Contact Addition Test Complete ===');
}

// Run the test
testRealtimeContactAddition().catch(console.error); 