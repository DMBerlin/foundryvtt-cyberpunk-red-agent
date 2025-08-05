/**
 * Test script to debug phone number search issues
 * Run this in the browser console to test the phone number search flow
 */

console.log("=== Cyberpunk Agent | Phone Search Debug Test ===");

// Test the exact flow that's failing
function testPhoneSearchFlow() {
  const instance = window.CyberpunkAgent?.instance;
  if (!instance) {
    console.error("Cyberpunk Agent instance not found!");
    return;
  }

  // Test with the problematic number
  const testNumber = '11192595832';
  console.log(`Testing with number: ${testNumber}`);

  // Step 1: Test normalization
  const normalized = instance.normalizePhoneNumber(testNumber);
  console.log(`Normalized: ${normalized}`);

  // Step 2: Test device lookup
  const deviceId = instance.getDeviceIdFromPhoneNumber(normalized);
  console.log(`Device ID found: ${deviceId}`);

  if (deviceId) {
    // Step 3: Test device info retrieval
    const device = instance.devices.get(deviceId);
    console.log(`Device info:`, device);

    // Step 4: Test the full addContactByPhoneNumber function
    const result = instance.addContactByPhoneNumber('test-device-id', normalized);
    console.log(`addContactByPhoneNumber result:`, result);
  } else {
    console.log("❌ No device found - this is the problem!");

    // Debug: Check what's in the phone number dictionary
    console.log("Available phone numbers in dictionary:");
    for (const [phone, devId] of instance.phoneNumberDictionary) {
      console.log(`  ${phone} -> ${devId}`);
    }
  }
}

// Test with different variations
function testPhoneNumberVariations() {
  const instance = window.CyberpunkAgent?.instance;
  if (!instance) {
    console.error("Cyberpunk Agent instance not found!");
    return;
  }

  const baseNumber = '11192595832';
  const variations = [
    baseNumber,
    baseNumber.replace(/\D/g, ''), // Remove any non-digits
    baseNumber.startsWith('1') ? baseNumber : `1${baseNumber}`,
    baseNumber.startsWith('1') ? baseNumber.substring(1) : baseNumber
  ];

  console.log("Testing phone number variations:");
  for (const variation of variations) {
    const normalized = instance.normalizePhoneNumber(variation);
    const deviceId = instance.getDeviceIdFromPhoneNumber(normalized);
    console.log(`  "${variation}" -> normalized: "${normalized}" -> deviceId: "${deviceId}"`);
  }
}

// Test the exact state that would be in the application
function testApplicationState() {
  const instance = window.CyberpunkAgent?.instance;
  if (!instance) {
    console.error("Cyberpunk Agent instance not found!");
    return;
  }

  // Simulate the application state
  const appState = {
    phoneNumber: '11192595832' // This is what would be stored in addContactState.phoneNumber
  };

  console.log("Simulating application state:");
  console.log(`  Raw phone number in state: "${appState.phoneNumber}"`);

  // Simulate the _onSearchClick flow
  const normalizedPhone = instance.normalizePhoneNumber(appState.phoneNumber);
  console.log(`  After normalization: "${normalizedPhone}"`);

  const contactDeviceId = instance.getDeviceIdFromPhoneNumber(normalizedPhone);
  console.log(`  Device ID found: "${contactDeviceId}"`);

  if (!contactDeviceId) {
    const displayNumber = instance.formatPhoneNumberForDisplay(normalizedPhone) || normalizedPhone;
    console.log(`  Error message would be: "Nenhum contato encontrado para o número ${displayNumber}"`);
  } else {
    console.log("✅ Contact found successfully!");
  }
}

// Run all tests
console.log("\n--- Running Phone Search Debug Tests ---");
testPhoneSearchFlow();
console.log("\n--- Testing Variations ---");
testPhoneNumberVariations();
console.log("\n--- Testing Application State ---");
testApplicationState();

console.log("\n=== End Debug Tests ==="); 