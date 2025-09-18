/**
 * Test script for contact deletion persistence
 * Tests that deleted contacts don't reappear after client refresh
 */

class ContactDeletionPersistenceTester {
  constructor() {
    this.agent = window.CyberpunkAgent?.instance;
    if (!this.agent) {
      throw new Error("CyberpunkAgent instance not found");
    }
  }

  /**
   * Test contact deletion persistence across client refresh simulation
   */
  async testContactDeletionPersistence() {
    console.log("Cyberpunk Agent | Testing contact deletion persistence...");

    // Get available devices
    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 2) {
      console.log("Cyberpunk Agent | Need at least 2 devices to test contact deletion persistence");
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

    // Step 2: Verify data is saved to server
    console.log("Step 2: Verifying data is saved to server...");
    const deviceData = game.settings.get('cyberpunk-agent', 'device-data');
    if (!deviceData || !deviceData.devices) {
      throw new Error("Device data not found in server settings");
    }

    const savedDevice1 = deviceData.devices[device1.id];
    const savedDevice2 = deviceData.devices[device2.id];

    if (!savedDevice1 || !savedDevice1.contacts || !savedDevice1.contacts.includes(device2.id)) {
      throw new Error("Device1 contact not saved to server");
    }
    if (!savedDevice2 || !savedDevice2.contacts || !savedDevice2.contacts.includes(device1.id)) {
      throw new Error("Device2 contact not saved to server");
    }
    console.log("✓ Contact data saved to server");

    // Step 3: Delete contact from device1
    console.log("Step 3: Deleting contact from device1...");
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

    // Step 4: Verify deletion is persisted to server
    console.log("Step 4: Verifying deletion is persisted to server...");

    // Force save to ensure data is persisted
    await this.agent.saveDeviceData();

    // Check server data directly
    const updatedDeviceData = game.settings.get('cyberpunk-agent', 'device-data');
    const updatedDevice1 = updatedDeviceData.devices[device1.id];

    if (!updatedDevice1 || !updatedDevice1.contacts) {
      throw new Error("Device1 data not found in server after deletion");
    }

    if (updatedDevice1.contacts.includes(device2.id)) {
      throw new Error("Contact still found in server data after deletion");
    }
    console.log("✓ Contact deletion persisted to server");

    // Step 5: Simulate client refresh by reloading device data
    console.log("Step 5: Simulating client refresh...");

    // Clear local device data
    this.agent.devices.clear();
    this.agent.deviceMappings.clear();

    // Reload from server (simulating client refresh)
    this.agent.loadDeviceData();

    // Verify contact is still deleted after "refresh"
    const refreshedContacts1 = this.agent.getContactsForDevice(device1.id);
    if (refreshedContacts1.includes(device2.id)) {
      throw new Error("Contact reappeared after simulated client refresh");
    }
    console.log("✓ Contact remains deleted after simulated refresh");

    // Step 6: Verify device2 still has device1 as contact (one-way deletion)
    const refreshedContacts2 = this.agent.getContactsForDevice(device2.id);
    if (!refreshedContacts2.includes(device1.id)) {
      throw new Error("Device2 should still have device1 as contact (one-way deletion)");
    }
    console.log("✓ Device2 still has device1 as contact (one-way deletion)");

    // Step 7: Test that messages still work
    console.log("Step 7: Testing that messages still work after deletion...");
    const testMessage = {
      id: `test-persistence-${Date.now()}`,
      senderId: device2.id,
      receiverId: device1.id,
      text: "Message from deleted contact after refresh",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      read: false
    };

    await this.agent.saveMessageToServer(device2.id, device1.id, testMessage);

    const messages = this.agent.getMessagesForDeviceConversation(device1.id, device2.id);
    const receivedMessage = messages.find(msg => msg.id === testMessage.id);

    if (!receivedMessage) {
      throw new Error("Message from deleted contact not received after refresh");
    }
    console.log("✓ Messages still work after contact deletion and refresh");

    console.log("Cyberpunk Agent | Contact deletion persistence test passed!");
    return true;
  }

  /**
   * Test that auto-contact addition still works after deletion
   */
  async testAutoContactAdditionAfterDeletion() {
    console.log("Cyberpunk Agent | Testing auto-contact addition after deletion...");

    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 2) {
      console.log("Cyberpunk Agent | Need at least 2 devices to test auto-contact addition");
      return true;
    }

    const device1 = devices[0];
    const device2 = devices[1];

    // Ensure device1 doesn't have device2 as contact
    const contacts1 = this.agent.getContactsForDevice(device1.id);
    if (contacts1.includes(device2.id)) {
      await this.agent.removeContactFromDevice(device1.id, device2.id);
    }

    // Send message from device2 to device1 (who deleted device2)
    const autoAddMessage = {
      id: `test-auto-add-${Date.now()}`,
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

    return true;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.testContactDeletionPersistence();
      await this.testAutoContactAdditionAfterDeletion();
      console.log("Cyberpunk Agent | All contact deletion persistence tests passed!");
    } catch (error) {
      console.error("Cyberpunk Agent | Contact deletion persistence test failed:", error);
      throw error;
    }
  }
}

// Global test function
window.testContactDeletionPersistence = async function () {
  const tester = new ContactDeletionPersistenceTester();
  await tester.runAllTests();
};

// Export for use in other scripts
window.ContactDeletionPersistenceTester = ContactDeletionPersistenceTester;
