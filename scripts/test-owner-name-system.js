/**
 * Test script for the hybrid owner name system
 * Tests real-time updates, fallback mechanisms, and console functions
 */

console.log("🧪 Testing Hybrid Owner Name System...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check current device registry
  console.log("\n📋 Current Device Registry:");
  console.log("Device ID | Owner Name | Phone Number");
  console.log("----------|-------------|-------------");

  const devices = window.cyberpunkAgent.devices;
  if (devices && devices.size > 0) {
    for (const [deviceId, device] of devices) {
      const phoneNumber = window.cyberpunkAgent.devicePhoneNumbers.get(deviceId);
      const formattedPhone = phoneNumber ? window.cyberpunkAgent.formatPhoneNumberForDisplay(phoneNumber) : 'No phone';
      const ownerName = window.cyberpunkAgent.getDeviceOwnerName(deviceId);
      console.log(`${deviceId} | ${ownerName} | ${formattedPhone}`);
    }
  } else {
    console.log("No devices found in registry");
  }

  // Test 3: Test migration function
  console.log("\n🔄 Testing migration function...");
  console.log("Run: window.cyberpunkAgent.migrateOwnerNames()");

  // Test 4: Test force update function
  console.log("\n🔄 Testing force update function...");
  console.log("Run: window.cyberpunkAgent.updateAllOwnerNames()");

  // Test 5: Test sync function
  console.log("\n🔄 Testing sync function...");
  console.log("Run: window.cyberpunkAgent.syncAllAgents()");

  // Test 6: Test real-time name change detection
  console.log("\n🎯 Testing real-time name change detection:");
  console.log("1. Rename an actor in FoundryVTT");
  console.log("2. Check if device registry updates automatically");
  console.log("3. Run: window.cyberpunkAgent.getDeviceOwnerName('device-id-here')");

  // Test 7: Test fallback mechanism
  console.log("\n🛡️ Testing fallback mechanism:");
  console.log("1. Temporarily remove ownerName from a device");
  console.log("2. Run: window.cyberpunkAgent.getDeviceOwnerName('device-id-here')");
  console.log("3. Should fallback to actor lookup");

  // Test 8: Available console functions
  console.log("\n🛠️ Available Console Functions:");
  console.log("- window.cyberpunkAgent.migrateOwnerNames()");
  console.log("- window.cyberpunkAgent.updateAllOwnerNames()");
  console.log("- window.cyberpunkAgent.syncAllAgents()");
  console.log("- window.cyberpunkAgent.getDeviceOwnerName(deviceId)");
  console.log("- window.cyberpunkAgent.devices (view all devices)");
  console.log("- window.cyberpunkAgent.devicePhoneNumbers (view phone numbers)");

  console.log("\n✅ Hybrid Owner Name System test setup complete!");
  console.log("Run the suggested functions to test the system.");
} 