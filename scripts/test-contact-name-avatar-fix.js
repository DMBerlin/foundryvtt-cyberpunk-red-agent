/**
 * Test script for contact name and avatar fix
 * Tests that contacts display with correct names and avatars instead of "Agent" and default icon
 */

console.log("🧪 Testing Contact Name and Avatar Fix...");

// Test 1: Check if the system is available
if (!window.cyberpunkAgent) {
  console.error("❌ window.cyberpunkAgent not available");
  console.log("Please ensure the module is loaded and try again");
} else {
  console.log("✅ window.cyberpunkAgent is available");

  // Test 2: Check current device data
  console.log("\n📋 Current Device Data:");
  console.log("Device ID | Owner Name | Device Name | Avatar");
  console.log("----------|-------------|-------------|--------");

  const devices = window.cyberpunkAgent.devices;
  if (devices && devices.size > 0) {
    for (const [deviceId, device] of devices) {
      console.log(`${deviceId} | ${device.ownerName || 'Unknown'} | ${device.deviceName || 'Unknown'} | ${device.img || 'No avatar'}`);
    }
  } else {
    console.log("No devices found");
  }

  // Test 3: Check if devices need migration
  console.log("\n🔍 Checking for devices that need migration:");
  let needsMigration = 0;
  let alreadyCorrect = 0;

  if (devices && devices.size > 0) {
    for (const [deviceId, device] of devices) {
      const actorId = device.ownerActorId;
      if (actorId) {
        const actor = game.actors.get(actorId);
        if (actor) {
          const shouldUseActorName = device.deviceName !== actor.name;
          const shouldUseActorAvatar = device.img !== actor.img;

          if (shouldUseActorName || shouldUseActorAvatar) {
            needsMigration++;
            console.log(`⚠️  Device ${deviceId} needs migration:`);
            console.log(`   Current name: "${device.deviceName}" → Should be: "${actor.name}"`);
            console.log(`   Current avatar: "${device.img}" → Should be: "${actor.img}"`);
          } else {
            alreadyCorrect++;
          }
        }
      }
    }
  }

  console.log(`\n📊 Migration Status:`);
  console.log(`   Devices needing migration: ${needsMigration}`);
  console.log(`   Devices already correct: ${alreadyCorrect}`);

  // Test 4: Test migration function
  if (needsMigration > 0) {
    console.log("\n🔄 Running migration...");
    console.log("Execute: window.cyberpunkAgent.migrateDeviceNamesAndAvatars()");
  } else {
    console.log("\n✅ All devices already have correct names and avatars!");
  }

  // Test 5: Test contact display simulation
  console.log("\n🎯 Testing Contact Display:");
  if (devices && devices.size > 0) {
    const firstDevice = Array.from(devices.values())[0];
    const contacts = window.cyberpunkAgent.getContactsForDevice(firstDevice.id);

    if (contacts && contacts.length > 0) {
      console.log(`\nContacts for device ${firstDevice.deviceName}:`);
      contacts.forEach(contactDeviceId => {
        const contactDevice = window.cyberpunkAgent.devices.get(contactDeviceId);
        if (contactDevice) {
          console.log(`  📱 ${contactDevice.deviceName} (${contactDevice.img})`);
        }
      });
    } else {
      console.log("No contacts found for this device");
    }
  }

  // Test 6: Test add contact flow
  console.log("\n🎯 Testing Add Contact Flow:");
  console.log("1. Open any agent device");
  console.log("2. Navigate to Chat7");
  console.log("3. Right-click on contacts background");
  console.log("4. Select 'Adicionar Contato'");
  console.log("5. Enter a phone number of another device");
  console.log("6. Click 'BUSCAR' and verify the contact shows with correct name and avatar");
  console.log("7. Add the contact and verify it appears in the list with correct name and avatar");

  // Test 7: Available functions
  console.log("\n🛠️ Available Functions:");
  console.log("- window.cyberpunkAgent.migrateDeviceNamesAndAvatars() - Fix existing devices");
  console.log("- window.cyberpunkAgent.getAllRegisteredDevices() - List all devices");
  console.log("- window.cyberpunkAgent.syncAllAgents() - Sync all agents");

  // Test 8: Expected behavior after fix
  console.log("\n✅ Expected Behavior After Fix:");
  console.log("1. New devices created with actor names and avatars");
  console.log("2. Existing devices can be migrated to use actor data");
  console.log("3. Contacts display with actual character names");
  console.log("4. Contacts display with actual character avatars");
  console.log("5. No more 'Agent' names or mystery-man icons");

  console.log("\n🎉 Contact Name and Avatar Fix test setup complete!");
  console.log("Run the migration function if needed, then test the add contact functionality.");
} 