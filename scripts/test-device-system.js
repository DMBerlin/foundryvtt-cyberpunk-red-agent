/**
 * Test script for Cyberpunk Agent v2.0.0 device system
 */

class DeviceSystemTester {
  constructor() {
    this.agent = CyberpunkAgent.instance;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("Cyberpunk Agent | Starting device system tests...");

    try {
      await this.testDeviceDiscovery();
      await this.testDeviceManagement();
      await this.testUserAccess();
      await this.testDeviceDataPersistence();

      console.log("Cyberpunk Agent | All device system tests completed successfully!");
      ui.notifications.info("Device system tests completed successfully!");

    } catch (error) {
      console.error("Cyberpunk Agent | Device system tests failed:", error);
      ui.notifications.error("Device system tests failed. Check console for details.");
    }
  }

  /**
   * Test device discovery
   */
  async testDeviceDiscovery() {
    console.log("Cyberpunk Agent | Testing device discovery...");

    // Run device discovery
    await this.agent.discoverAgentDevices();

    // Check if devices were found
    const totalDevices = this.agent.devices.size;
    const totalMappings = this.agent.deviceMappings.size;

    console.log(`Cyberpunk Agent | Found ${totalDevices} devices and ${totalMappings} actor mappings`);

    if (totalDevices === 0) {
      console.warn("Cyberpunk Agent | No devices found. Make sure characters have Agent items in their inventory.");
    }

    return totalDevices > 0;
  }

  /**
   * Test device management
   */
  async testDeviceManagement() {
    console.log("Cyberpunk Agent | Testing device management...");

    const devices = Array.from(this.agent.devices.values());

    for (const device of devices) {
      console.log(`Cyberpunk Agent | Testing device: ${device.deviceName} (${device.id})`);

      // Test device properties
      if (!device.id || !device.ownerActorId || !device.deviceName) {
        throw new Error(`Device ${device.id} missing required properties`);
      }

      // Test device mappings
      const actorDevices = this.agent.getDevicesForActor(device.ownerActorId);
      if (!actorDevices.some(d => d.id === device.id)) {
        throw new Error(`Device ${device.id} not found in actor ${device.ownerActorId} mappings`);
      }
    }

    console.log(`Cyberpunk Agent | Successfully tested ${devices.length} devices`);
    return true;
  }

  /**
   * Test user access
   */
  async testUserAccess() {
    console.log("Cyberpunk Agent | Testing user access...");

    const accessibleDevices = this.agent.getUserAccessibleDevices();
    console.log(`Cyberpunk Agent | User has access to ${accessibleDevices.length} devices`);

    if (game.user.isGM) {
      // GM should have access to all devices
      const totalDevices = this.agent.devices.size;
      if (accessibleDevices.length !== totalDevices) {
        console.warn(`Cyberpunk Agent | GM access mismatch: ${accessibleDevices.length} accessible vs ${totalDevices} total`);
      }
    } else {
      // Regular users should only have access to their owned devices
      const userActors = this.agent.getUserActors();
      let expectedDevices = 0;

      for (const actor of userActors) {
        const actorDevices = this.agent.getDevicesForActor(actor.id);
        expectedDevices += actorDevices.length;
      }

      if (accessibleDevices.length !== expectedDevices) {
        console.warn(`Cyberpunk Agent | User access mismatch: ${accessibleDevices.length} accessible vs ${expectedDevices} expected`);
      }
    }

    return true;
  }

  /**
   * Test device data persistence
   */
  async testDeviceDataPersistence() {
    console.log("Cyberpunk Agent | Testing device data persistence...");

    // Save current data
    this.agent.saveDeviceData();

    // Clear in-memory data
    const originalDevices = new Map(this.agent.devices);
    const originalMappings = new Map(this.agent.deviceMappings);

    this.agent.devices.clear();
    this.agent.deviceMappings.clear();

    // Reload data
    this.agent.loadDeviceData();

    // Verify data was restored
    if (this.agent.devices.size !== originalDevices.size) {
      throw new Error(`Device count mismatch after reload: ${this.agent.devices.size} vs ${originalDevices.size}`);
    }

    if (this.agent.deviceMappings.size !== originalMappings.size) {
      throw new Error(`Mapping count mismatch after reload: ${this.agent.deviceMappings.size} vs ${originalMappings.size}`);
    }

    console.log("Cyberpunk Agent | Device data persistence test passed");
    return true;
  }

  /**
   * Test device contact management
   */
  async testDeviceContacts() {
    console.log("Cyberpunk Agent | Testing device contact management...");

    const devices = Array.from(this.agent.devices.values());
    if (devices.length < 2) {
      console.log("Cyberpunk Agent | Need at least 2 devices to test contact management");
      return true;
    }

    const device1 = devices[0];
    const device2 = devices[1];

    // Test adding contact
    const addResult = this.agent.addContactToDevice(device1.id, device2.id);
    if (!addResult) {
      throw new Error(`Failed to add contact from ${device1.id} to ${device2.id}`);
    }

    // Verify contact was added
    const contacts = this.agent.getContactsForDevice(device1.id);
    if (!contacts.includes(device2.id)) {
      throw new Error(`Contact ${device2.id} not found in device ${device1.id} contacts`);
    }

    // Test removing contact
    const removeResult = this.agent.removeContactFromDevice(device1.id, device2.id);
    if (!removeResult) {
      throw new Error(`Failed to remove contact from ${device1.id} to ${device2.id}`);
    }

    // Verify contact was removed
    const contactsAfter = this.agent.getContactsForDevice(device1.id);
    if (contactsAfter.includes(device2.id)) {
      throw new Error(`Contact ${device2.id} still found in device ${device1.id} contacts after removal`);
    }

    console.log("Cyberpunk Agent | Device contact management test passed");
    return true;
  }
}

// Global test function
window.testDeviceSystem = async function () {
  const tester = new DeviceSystemTester();
  await tester.runAllTests();
};

// Export for use in other scripts
window.DeviceSystemTester = DeviceSystemTester; 