/**
 * Test script for contact deletion and message behavior
 * Tests that deleted contacts can still send messages to the user
 */

class ContactDeletionTester {
  constructor() {
    this.agent = window.CyberpunkAgent?.instance;
    if (!this.agent) {
      throw new Error("CyberpunkAgent instance not found");
    }
  }

  /**
   * Test that deleted contacts can still send messages
   */
  async testContactDeletionMessageBehavior() {
    console.log("Cyberpunk Agent | Testing contact deletion and message behavior...");

    // Get available devices
    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 2) {
      console.log("Cyberpunk Agent | Need at least 2 devices to test contact deletion");
      return true;
    }

    const device1 = devices[0];
    const device2 = devices[1];

    console.log(`Testing with devices: ${device1.id} and ${device2.id}`);

    // Step 1: Add contact relationship
    console.log("Step 1: Adding contact relationship...");
    await this.agent.addContactToDevice(device1.id, device2.id);
    await this.agent.addContactToDevice(device2.id, device1.id);

    // Verify both devices have each other as contacts
    let contacts1 = this.agent.getContactsForDevice(device1.id);
    let contacts2 = this.agent.getContactsForDevice(device2.id);

    if (!contacts1.includes(device2.id) || !contacts2.includes(device1.id)) {
      throw new Error("Failed to establish contact relationship");
    }
    console.log("✓ Contact relationship established");

    // Step 2: Send initial message
    console.log("Step 2: Sending initial message...");
    const initialMessage = {
      id: `test-msg-${Date.now()}`,
      senderId: device1.id,
      receiverId: device2.id,
      text: "Initial message before deletion",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device1.id, device2.id, initialMessage);
    console.log("✓ Initial message sent");

    // Step 3: Remove contact from device1's list
    console.log("Step 3: Removing contact from device1's list...");
    const removeResult = await this.agent.removeContactFromDevice(device1.id, device2.id);
    if (!removeResult) {
      throw new Error("Failed to remove contact from device1");
    }

    // Verify contact was removed from device1's list
    contacts1 = this.agent.getContactsForDevice(device1.id);
    if (contacts1.includes(device2.id)) {
      throw new Error("Contact still found in device1's contacts after removal");
    }
    console.log("✓ Contact removed from device1's list");

    // Step 4: Verify device2 still has device1 as contact
    contacts2 = this.agent.getContactsForDevice(device2.id);
    if (!contacts2.includes(device1.id)) {
      throw new Error("Device2 should still have device1 as contact");
    }
    console.log("✓ Device2 still has device1 as contact");

    // Step 5: Send message from device2 to device1 (deleted contact)
    console.log("Step 5: Sending message from deleted contact...");
    const messageFromDeletedContact = {
      id: `test-msg-deleted-${Date.now()}`,
      senderId: device2.id,
      receiverId: device1.id,
      text: "Message from deleted contact",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device2.id, device1.id, messageFromDeletedContact);
    console.log("✓ Message sent from deleted contact");

    // Step 6: Verify message was received and stored
    const messages = this.agent.getMessagesForDeviceConversation(device1.id, device2.id);
    const receivedMessage = messages.find(msg => msg.id === messageFromDeletedContact.id);

    if (!receivedMessage) {
      throw new Error("Message from deleted contact was not received");
    }
    console.log("✓ Message from deleted contact was received and stored");

    // Step 7: Verify device1 can still send messages to device2
    console.log("Step 7: Testing message sending from device1 to device2...");
    const messageToDeletedContact = {
      id: `test-msg-to-deleted-${Date.now()}`,
      senderId: device1.id,
      receiverId: device2.id,
      text: "Message to deleted contact",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device1.id, device2.id, messageToDeletedContact);
    console.log("✓ Message sent to deleted contact");

    // Step 8: Verify all messages are preserved
    const allMessages = this.agent.getMessagesForDeviceConversation(device1.id, device2.id);
    if (allMessages.length < 3) {
      throw new Error(`Expected at least 3 messages, found ${allMessages.length}`);
    }
    console.log(`✓ All messages preserved (${allMessages.length} total)`);

    console.log("Cyberpunk Agent | Contact deletion and message behavior test passed!");
    return true;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.testContactDeletionMessageBehavior();
      console.log("Cyberpunk Agent | All contact deletion tests passed!");
    } catch (error) {
      console.error("Cyberpunk Agent | Contact deletion test failed:", error);
      throw error;
    }
  }
}

// Global test function
window.testContactDeletion = async function () {
  const tester = new ContactDeletionTester();
  await tester.runAllTests();
};

// Export for use in other scripts
window.ContactDeletionTester = ContactDeletionTester;
