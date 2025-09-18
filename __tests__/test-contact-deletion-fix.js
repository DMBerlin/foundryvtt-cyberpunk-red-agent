/**
 * Test script for contact deletion fix
 * Tests that the contact deletion functionality works without errors
 */

class ContactDeletionFixTester {
  constructor() {
    this.agent = window.CyberpunkAgent?.instance;
    if (!this.agent) {
      throw new Error("CyberpunkAgent instance not found");
    }
  }

  /**
   * Test contact deletion without errors
   */
  async testContactDeletionFix() {
    console.log("Cyberpunk Agent | Testing contact deletion fix...");

    // Get available devices
    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 2) {
      console.log("Cyberpunk Agent | Need at least 2 devices to test contact deletion fix");
      return true;
    }

    const device1 = devices[0];
    const device2 = devices[1];

    console.log(`Testing with devices: ${device1.id} and ${device2.id}`);

    // Step 1: Establish contact relationship
    console.log("Step 1: Establishing contact relationship...");
    await this.agent.addContactToDevice(device1.id, device2.id);
    await this.agent.addContactToDevice(device2.id, device1.id);

    // Verify both devices have each other as contacts
    let contacts1 = this.agent.getContactsForDevice(device1.id);
    let contacts2 = this.agent.getContactsForDevice(device2.id);

    if (!contacts1.includes(device2.id) || !contacts2.includes(device1.id)) {
      throw new Error("Failed to establish contact relationship");
    }
    console.log("✓ Contact relationship established");

    // Step 2: Test contact deletion
    console.log("Step 2: Testing contact deletion...");

    // Simulate the context menu contact object creation
    const contactDevice = this.agent.devices.get(device2.id);
    if (!contactDevice) {
      throw new Error("Contact device not found in devices map");
    }

    const contact = {
      id: device2.id,
      name: contactDevice.deviceName || contactDevice.ownerName || `Device ${device2.id}`,
      deviceName: contactDevice.deviceName,
      ownerName: contactDevice.ownerName
    };

    console.log(`✓ Contact object created: ${contact.name}`);

    // Step 3: Delete contact
    console.log("Step 3: Deleting contact...");
    const deleteResult = await this.agent.removeContactFromDevice(device1.id, device2.id);
    if (!deleteResult) {
      throw new Error("Failed to delete contact from device1");
    }

    // Verify contact was removed from device1's list
    contacts1 = this.agent.getContactsForDevice(device1.id);
    if (contacts1.includes(device2.id)) {
      throw new Error("Contact still found in device1's contacts after deletion");
    }
    console.log("✓ Contact removed from device1's list");

    // Step 4: Verify device2 still has device1 as contact (one-way deletion)
    contacts2 = this.agent.getContactsForDevice(device2.id);
    if (!contacts2.includes(device1.id)) {
      throw new Error("Device2 should still have device1 as contact (one-way deletion)");
    }
    console.log("✓ Device2 still has device1 as contact (one-way deletion)");

    // Step 5: Test that messages still work
    console.log("Step 5: Testing that messages still work after deletion...");
    const testMessage = {
      id: `test-deletion-fix-${Date.now()}`,
      senderId: device2.id,
      receiverId: device1.id,
      text: "Message from deleted contact",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device2.id, device1.id, testMessage);

    const messages = this.agent.getMessagesForDeviceConversation(device1.id, device2.id);
    const receivedMessage = messages.find(msg => msg.id === testMessage.id);

    if (!receivedMessage) {
      throw new Error("Message from deleted contact not received");
    }
    console.log("✓ Messages still work after contact deletion");

    // Step 6: Test auto-contact addition
    console.log("Step 6: Testing auto-contact addition after deletion...");

    // Send another message to trigger auto-contact addition
    const autoAddMessage = {
      id: `test-auto-add-fix-${Date.now()}`,
      senderId: device2.id,
      receiverId: device1.id,
      text: "Message to trigger auto-contact addition",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device2.id, device1.id, autoAddMessage);

    // Check if device1 now has device2 as contact (auto-added)
    const updatedContacts1 = this.agent.getContactsForDevice(device1.id);
    if (!updatedContacts1.includes(device2.id)) {
      throw new Error("Auto-contact addition failed after deletion");
    }
    console.log("✓ Auto-contact addition works after deletion");

    console.log("Cyberpunk Agent | Contact deletion fix test passed!");
    return true;
  }

  /**
   * Test error handling for non-existent contacts
   */
  async testErrorHandling() {
    console.log("Cyberpunk Agent | Testing error handling for contact deletion...");

    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 1) {
      console.log("Cyberpunk Agent | Need at least 1 device to test error handling");
      return true;
    }

    const device1 = devices[0];
    const nonExistentContactId = "non-existent-contact-id";

    // Test deleting a non-existent contact
    console.log("Testing deletion of non-existent contact...");
    const deleteResult = await this.agent.removeContactFromDevice(device1.id, nonExistentContactId);
    if (deleteResult) {
      throw new Error("Deletion of non-existent contact should return false");
    }
    console.log("✓ Non-existent contact deletion handled correctly");

    console.log("Cyberpunk Agent | Error handling test passed!");
    return true;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.testContactDeletionFix();
      await this.testErrorHandling();
      console.log("Cyberpunk Agent | All contact deletion fix tests passed!");
    } catch (error) {
      console.error("Cyberpunk Agent | Contact deletion fix test failed:", error);
      throw error;
    }
  }
}

// Global test function
window.testContactDeletionFix = async function () {
  const tester = new ContactDeletionFixTester();
  await tester.runAllTests();
};

// Export for use in other scripts
window.ContactDeletionFixTester = ContactDeletionFixTester;
