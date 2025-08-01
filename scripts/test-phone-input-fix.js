/**
 * Test script for phone input fix in add contact functionality
 * Tests that phone numbers are preserved during search operations
 */

console.log("🧪 Testing Phone Input Fix...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check available devices
  console.log("\n📋 Available Devices:");
  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    allDevices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.ownerName} - ${device.phoneNumber}`);
    });
  } else {
    console.log("No devices found");
  }

  // Test 3: Test phone number normalization
  console.log("\n🔍 Testing Phone Number Normalization:");
  const testNumbers = [
    '11192595832',
    '1192595832',
    '+1 (119) 259-5832',
    '(119) 259-5832',
    '119-259-5832'
  ];

  testNumbers.forEach(number => {
    const normalized = window.cyberpunkAgent.normalizePhoneNumber(number);
    const formatted = window.cyberpunkAgent.formatPhoneNumberForDisplay(normalized);
    console.log(`Input: "${number}" → Normalized: "${normalized}" → Formatted: "${formatted}"`);
  });

  // Test 4: Test device lookup by phone number
  console.log("\n📞 Testing Device Lookup by Phone Number:");
  if (allDevices && allDevices.length > 0) {
    const testDevice = allDevices[0];
    const phoneNumber = testDevice.phoneNumber.replace(/\D/g, ''); // Remove formatting
    const deviceId = window.cyberpunkAgent.getDeviceIdFromPhoneNumber(phoneNumber);
    console.log(`Phone: ${testDevice.phoneNumber} → Device ID: ${deviceId}`);
    console.log(`Expected: ${testDevice.deviceId}`);
    console.log(`Match: ${deviceId === testDevice.deviceId ? '✅' : '❌'}`);
  }

  // Test 5: Test add contact flow simulation
  console.log("\n🎯 Testing Add Contact Flow:");
  console.log("1. Open any agent device");
  console.log("2. Navigate to Chat7");
  console.log("3. Right-click on contacts background");
  console.log("4. Select 'Adicionar Contato'");
  console.log("5. Enter a phone number (e.g., 11192595832)");
  console.log("6. Click 'BUSCAR'");
  console.log("7. Verify the phone number is preserved and search works");

  // Test 6: Debug functions
  console.log("\n🛠️ Debug Functions Available:");
  console.log("- window.cyberpunkAgent.debugAllContactNumbers() - List all phone numbers");
  console.log("- window.cyberpunkAgent.debugSearchPhoneNumber('number') - Test specific number");
  console.log("- window.cyberpunkAgent.getAllRegisteredDevices() - List all devices");

  // Test 7: Expected behavior after fix
  console.log("\n✅ Expected Behavior After Fix:");
  console.log("1. Phone number input preserves value during search");
  console.log("2. Masking is applied correctly");
  console.log("3. Search finds existing devices");
  console.log("4. No more 'empty phone number' errors");

  console.log("\n🎉 Phone Input Fix test setup complete!");
  console.log("Test the add contact functionality to verify the fix works.");
} 