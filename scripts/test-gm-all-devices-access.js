/**
 * Test script for GM access to all registered devices
 * Tests the new behavior where GM can operate any device in the system
 */

console.log("🧪 Testing GM All Devices Access...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check if user is GM
  if (!game.user.isGM) {
    console.log("⚠️  Current user is not GM - some tests may not work as expected");
    console.log("   GM tests should be run by a GM user");
  } else {
    console.log("✅ Current user is GM");
  }

  // Test 3: Check all registered devices
  console.log("\n📋 All Registered Devices (GM Access):");
  console.log("Device ID | Owner Name | Phone Number | Device Name");
  console.log("----------|-------------|-------------|-------------");

  const allDevices = window.cyberpunkAgent.getAllRegisteredDevices();
  if (allDevices && allDevices.length > 0) {
    allDevices.forEach(device => {
      console.log(`${device.deviceId} | ${device.ownerName} | ${device.phoneNumber} | ${device.deviceName}`);
    });
    console.log(`\n📊 Total devices available to GM: ${allDevices.length}`);
  } else {
    console.log("No devices found in registry");
  }

  // Test 4: Test device selection menu
  console.log("\n🔄 Testing device selection menu...");
  console.log("Run: window.cyberpunkAgent.showAllDevicesMenu(window.cyberpunkAgent.getAllRegisteredDevices())");

  // Test 5: Test individual device access
  if (allDevices && allDevices.length > 0) {
    const firstDevice = allDevices[0];
    console.log(`\n🎯 Testing individual device access...`);
    console.log(`Run: window.cyberpunkAgent.openSpecificAgent('${firstDevice.deviceId}')`);
    console.log(`   This will open the device for: ${firstDevice.ownerName}`);
  }

  // Test 6: Test token controls behavior
  console.log("\n🎮 Testing token controls behavior:");
  console.log("1. Select any token on the canvas");
  console.log("2. Look for the agent icon in token controls");
  console.log("3. Click on it to see the device selection menu");
  console.log("4. Select any device to operate as that character");

  // Test 7: Available console functions for GM
  console.log("\n🛠️ Available Console Functions for GM:");
  console.log("- window.cyberpunkAgent.getAllRegisteredDevices() - Get all devices");
  console.log("- window.cyberpunkAgent.showAllDevicesMenu(devices) - Show device selection menu");
  console.log("- window.cyberpunkAgent.openSpecificAgent(deviceId) - Open specific device");
  console.log("- window.cyberpunkAgent.getDeviceOwnerName(deviceId) - Get device owner name");
  console.log("- window.cyberpunkAgent.syncAllAgents() - Sync all agents");

  // Test 8: Behavior comparison
  console.log("\n📊 Behavior Comparison:");
  console.log("GM Behavior:");
  console.log("  ✅ Access to ALL registered devices");
  console.log("  ✅ Can operate any device in the system");
  console.log("  ✅ Device selection menu shows all devices");
  console.log("  ✅ Can act as any character with a device");
  console.log("");
  console.log("Player Behavior:");
  console.log("  ✅ Access only to their equipped agents");
  console.log("  ✅ Can only operate their own devices");
  console.log("  ✅ Device selection limited to owned characters");
  console.log("  ✅ Cannot access other players' devices");

  console.log("\n✅ GM All Devices Access test setup complete!");
  console.log("Test the token controls by selecting a token and clicking the agent icon.");
} 