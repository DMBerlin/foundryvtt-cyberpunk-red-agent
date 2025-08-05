/**
 * Test script to verify phone number synchronization for all equipped devices
 * Run this in the browser console to test the phone number assignment fix
 */

console.log("=== Cyberpunk Agent | Phone Number Sync Test ===");

// Test the phone number synchronization
async function testPhoneNumberSync() {
  const instance = window.CyberpunkAgent?.instance;
  if (!instance) {
    console.error("Cyberpunk Agent instance not found!");
    return;
  }

  console.log("Testing phone number synchronization for all equipped devices...");

  // Get equipped agents (this should now assign phone numbers to all devices)
  const equippedAgents = await instance.getEquippedAgentsForUser();
  console.log(`Found ${equippedAgents.length} equipped agents`);

  // Check how many devices now have phone numbers
  console.log(`Total devices with phone numbers: ${instance.phoneNumberDictionary.size}`);

  // Verify that all equipped devices have phone numbers
  let missingPhoneNumbers = 0;
  for (const agent of equippedAgents) {
    const hasPhoneNumber = instance.devicePhoneNumbers.has(agent.deviceId);
    if (!hasPhoneNumber) {
      console.log(`❌ Device ${agent.deviceId} (${agent.actorName} - ${agent.itemName}) missing phone number`);
      missingPhoneNumbers++;
    } else {
      const phoneNumber = instance.devicePhoneNumbers.get(agent.deviceId);
      const formattedNumber = instance.formatPhoneNumberForDisplay(phoneNumber);
      console.log(`✅ Device ${agent.deviceId} (${agent.actorName} - ${agent.itemName}) has phone number: ${formattedNumber}`);
    }
  }

  if (missingPhoneNumbers === 0) {
    console.log("🎉 All equipped devices now have phone numbers assigned!");
  } else {
    console.log(`⚠️  ${missingPhoneNumbers} devices still missing phone numbers`);
  }

  // Test the search functionality for a specific number
  console.log("\n--- Testing Search Functionality ---");
  const testNumber = '11192595832';
  console.log(`Testing search for: ${testNumber}`);

  const normalized = instance.normalizePhoneNumber(testNumber);
  console.log(`Normalized: ${normalized}`);

  const deviceId = instance.getDeviceIdFromPhoneNumber(normalized);
  console.log(`Device ID found: ${deviceId}`);

  if (deviceId) {
    const device = instance.devices.get(deviceId);
    console.log(`Device info:`, device);
    console.log("✅ Search functionality working correctly!");
  } else {
    console.log("❌ Search functionality still not working");
  }
}

// Test the contact addition flow
async function testContactAdditionFlow() {
  const instance = window.CyberpunkAgent?.instance;
  if (!instance) {
    console.error("Cyberpunk Agent instance not found!");
    return;
  }

  console.log("\n--- Testing Contact Addition Flow ---");

  // Simulate the exact flow from the application
  const testNumber = '11192595832';
  console.log(`Testing with number: ${testNumber}`);

  // Step 1: Normalize the phone number
  const normalizedPhone = instance.normalizePhoneNumber(testNumber);
  console.log(`Normalized phone: ${normalizedPhone}`);

  // Step 2: Search for the phone number
  const contactDeviceId = instance.getDeviceIdFromPhoneNumber(normalizedPhone);
  console.log(`Contact device ID: ${contactDeviceId}`);

  if (contactDeviceId) {
    // Step 3: Get contact device info
    const contactDevice = instance.devices.get(contactDeviceId);
    console.log(`Contact device info:`, contactDevice);

    // Step 4: Test the full addContactByPhoneNumber function
    const result = instance.addContactByPhoneNumber('test-device-id', normalizedPhone);
    console.log(`addContactByPhoneNumber result:`, result);

    if (result.success) {
      console.log("✅ Contact addition flow working correctly!");
    } else {
      console.log(`❌ Contact addition failed: ${result.message}`);
    }
  } else {
    console.log("❌ Contact not found in search");
  }
}

// Run all tests
console.log("\n--- Running Phone Number Sync Tests ---");
await testPhoneNumberSync();
await testContactAdditionFlow();

console.log("\n=== End Phone Number Sync Tests ==="); 