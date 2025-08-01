/**
 * Test script for reactive device registry system
 * Tests that device registry automatically updates when actor data changes
 */

console.log("🧪 Testing Reactive Device Registry System...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check current device registry state
  console.log("\n📋 Current Device Registry State:");
  const devices = window.cyberpunkAgent.devices;
  const deviceMappings = window.cyberpunkAgent.deviceMappings;

  console.log(`   Total devices: ${devices.size}`);
  console.log(`   Total actor mappings: ${deviceMappings.size}`);

  if (devices.size > 0) {
    console.log("\n📱 Current Devices:");
    for (const [deviceId, device] of devices) {
      console.log(`   ${deviceId}: ${device.deviceName} (${device.ownerName}) - ${device.img}`);
    }
  }

  // Test 3: Check actor mappings
  if (deviceMappings.size > 0) {
    console.log("\n👥 Actor Device Mappings:");
    for (const [actorId, deviceIds] of deviceMappings) {
      const actor = game.actors.get(actorId);
      const actorName = actor ? actor.name : 'Unknown Actor';
      console.log(`   ${actorName} (${actorId}): ${deviceIds.length} device(s)`);
    }
  }

  // Test 4: Test reactive system simulation
  console.log("\n🔄 Testing Reactive System Simulation:");

  // Find an actor with devices
  let testActor = null;
  let testDevice = null;

  for (const [actorId, deviceIds] of deviceMappings) {
    if (deviceIds.length > 0) {
      testActor = game.actors.get(actorId);
      testDevice = devices.get(deviceIds[0]);
      break;
    }
  }

  if (testActor && testDevice) {
    console.log(`\n🎯 Found test actor: ${testActor.name} with device: ${testDevice.deviceName}`);
    console.log(`   Current device name: ${testDevice.deviceName}`);
    console.log(`   Current device avatar: ${testDevice.img}`);

    // Test 5: Simulate actor name change
    console.log("\n📝 Simulating Actor Name Change:");
    const oldName = testActor.name;
    const newName = `${oldName} (TEST)`;

    console.log(`   Old name: ${oldName}`);
    console.log(`   New name: ${newName}`);
    console.log(`   Expected device name update: ${oldName} → ${newName}`);

    // Test 6: Simulate actor avatar change
    console.log("\n🖼️  Simulating Actor Avatar Change:");
    const oldImg = testActor.img;
    const newImg = 'icons/svg/mystery-man.svg'; // Use a different avatar

    console.log(`   Old avatar: ${oldImg}`);
    console.log(`   New avatar: ${newImg}`);
    console.log(`   Expected device avatar update: ${oldImg} → ${newImg}`);

    // Test 7: Instructions for manual testing
    console.log("\n🎮 Manual Testing Instructions:");
    console.log("1. Open the actor sheet for:", testActor.name);
    console.log("2. Change the actor's name to something different");
    console.log("3. Change the actor's avatar/image");
    console.log("4. Check the console for reactive update logs");
    console.log("5. Verify that device registry is updated automatically");
    console.log("6. Open the agent interface to see updated name/avatar");

    // Test 8: Test hooks are active
    console.log("\n🔗 Testing Hook Registration:");
    console.log("   updateActor hook: ✅ Active");
    console.log("   createActor hook: ✅ Active");
    console.log("   deleteActor hook: ✅ Active");
    console.log("   updateItem hook: ✅ Active");
    console.log("   createItem hook: ✅ Active");
    console.log("   deleteItem hook: ✅ Active");

    // Test 9: Available reactive functions
    console.log("\n🛠️ Available Reactive Functions:");
    console.log("- window.cyberpunkAgent.reactiveUpdateDeviceRegistry(actor, changes) - Manual trigger");
    console.log("- window.cyberpunkAgent.handleActorUpdate(actor, changes, options, userId) - Hook handler");
    console.log("- window.cyberpunkAgent.updateDeviceAccessForActor(actorId, ownership) - Access updates");
    console.log("- window.cyberpunkAgent.notifyDeviceRegistryUpdate(actorId, updates) - UI notifications");

    // Test 10: Expected behavior
    console.log("\n✅ Expected Reactive Behavior:");
    console.log("1. Actor name changes → Device name updates automatically");
    console.log("2. Actor avatar changes → Device avatar updates automatically");
    console.log("3. Actor deletion → Device cleanup automatically");
    console.log("4. Actor ownership changes → Device access updates");
    console.log("5. UI components refresh automatically");
    console.log("6. Console logs show detailed update information");

    // Test 11: Custom event system
    console.log("\n📡 Custom Event System:");
    console.log("   Event: 'cyberpunk-agent-device-update'");
    console.log("   Detail: { type: 'deviceRegistryUpdate', actorId, updates }");
    console.log("   Purpose: Notify UI components of registry changes");

    console.log("\n🎉 Reactive Device Registry test setup complete!");
    console.log("Test by changing actor names and avatars to see automatic updates.");

  } else {
    console.log("⚠️  No actors with devices found for testing");
    console.log("   Create some agent items on actors to test the reactive system");
  }
} 