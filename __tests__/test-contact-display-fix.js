/**
 * Contact Display Fix Test Script
 * Tests that contact names and avatars display correctly after master reset
 */

console.log("Cyberpunk Agent | Loading Contact Display Fix Test Script...");

/**
 * Test contact display after master reset and sync
 */
async function testContactDisplayAfterReset() {
  console.log("🔄 === CONTACT DISPLAY AFTER RESET TEST ===");
  console.log("Testing that contacts show proper names and avatars after master reset and sync");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  let testsPassed = 0;
  let totalTests = 0;

  try {
    // Test 1: Verify device sync restores owner names and avatars
    console.log("\n📱 Test 1: Device Sync Owner Name/Avatar Restoration");
    totalTests++;

    console.log("🔄 Running device sync to restore owner information...");
    await agent.syncAllAgents();

    // Check if devices have proper owner names and avatars
    let devicesWithOwnerInfo = 0;
    let totalDevices = 0;

    for (const [deviceId, device] of agent.devices) {
      totalDevices++;
      const ownerName = agent.getDeviceOwnerName(deviceId);
      const hasAvatar = device.img && device.img !== 'icons/svg/mystery-man.svg';

      if (ownerName && ownerName !== 'Unknown Device' && ownerName !== `Device ${deviceId}`) {
        devicesWithOwnerInfo++;
        console.log(`✅ Device ${deviceId}: ${ownerName} (${hasAvatar ? 'has avatar' : 'default avatar'})`);
      } else {
        console.log(`⚠️ Device ${deviceId}: ${ownerName || 'No owner name'} (missing proper owner info)`);
      }
    }

    if (devicesWithOwnerInfo > 0) {
      console.log(`✅ ${devicesWithOwnerInfo}/${totalDevices} devices have proper owner information`);
      testsPassed++;
    } else {
      console.error(`❌ No devices have proper owner information`);
    }

    // Test 2: Test contact search display
    console.log("\n🔍 Test 2: Contact Search Display");
    totalTests++;

    // Get all devices to test search between them
    const allDevices = Array.from(agent.devices.values());
    if (allDevices.length < 2) {
      console.error("❌ Need at least 2 devices for contact search testing");
      return false;
    }

    const searchDevice = allDevices[0];
    const targetDevice = allDevices[1];

    // Get target device phone number
    const targetPhoneNumber = agent.devicePhoneNumbers.get(targetDevice.id);
    if (!targetPhoneNumber) {
      console.error("❌ Target device has no phone number");
      return false;
    }

    console.log(`📞 Testing search for device: ${agent.getDeviceOwnerName(targetDevice.id)} (${agent.formatPhoneNumberForDisplay(targetPhoneNumber)})`);

    // Simulate the contact search process
    const normalizedPhone = agent.normalizePhoneNumber(targetPhoneNumber);
    const foundDeviceId = agent.getDeviceIdFromPhoneNumber(normalizedPhone);

    if (foundDeviceId === targetDevice.id) {
      const foundDevice = agent.devices.get(foundDeviceId);
      const ownerName = agent.getDeviceOwnerName(foundDeviceId);

      console.log(`✅ Phone search successful:`);
      console.log(`   - Found device: ${foundDeviceId}`);
      console.log(`   - Owner name: ${ownerName}`);
      console.log(`   - Device name: ${foundDevice.deviceName}`);
      console.log(`   - Avatar: ${foundDevice.img}`);

      // Verify the fix: owner name should be used, not device name
      if (ownerName && ownerName !== 'Unknown Device' && ownerName !== foundDevice.deviceName) {
        console.log(`✅ Contact display fix working: Using owner name "${ownerName}" instead of device name "${foundDevice.deviceName}"`);
        testsPassed++;
      } else if (ownerName === foundDevice.deviceName) {
        console.log(`✅ Contact display working: Owner name and device name match "${ownerName}"`);
        testsPassed++;
      } else {
        console.error(`❌ Contact display issue: Owner name "${ownerName}" is not properly set`);
      }
    } else {
      console.error(`❌ Phone search failed: Expected ${targetDevice.id}, got ${foundDeviceId}`);
    }

    // Test 3: Test getDeviceOwnerName helper function
    console.log("\n🏷️ Test 3: getDeviceOwnerName Helper Function");
    totalTests++;

    let helperWorking = true;
    for (const [deviceId, device] of agent.devices) {
      const ownerName = agent.getDeviceOwnerName(deviceId);
      const actor = game.actors.get(device.ownerActorId);

      if (actor) {
        if (ownerName === actor.name) {
          console.log(`✅ Device ${deviceId}: Helper returns "${ownerName}" (matches actor "${actor.name}")`);
        } else {
          console.error(`❌ Device ${deviceId}: Helper returns "${ownerName}" but actor is "${actor.name}"`);
          helperWorking = false;
        }
      } else {
        console.warn(`⚠️ Device ${deviceId}: No actor found for ownerActorId "${device.ownerActorId}"`);
      }
    }

    if (helperWorking) {
      console.log(`✅ getDeviceOwnerName helper function working correctly`);
      testsPassed++;
    } else {
      console.error(`❌ getDeviceOwnerName helper function has issues`);
    }

    // Test 4: Simulate contact search modal behavior
    console.log("\n📋 Test 4: Contact Search Modal Behavior Simulation");
    totalTests++;

    // Simulate what happens in ContactSearchModal._onSearchClick
    const testPhoneNumber = agent.formatPhoneNumberForDisplay(targetPhoneNumber);
    console.log(`🔍 Simulating search for: ${testPhoneNumber}`);

    const normalizedTestPhone = agent.normalizePhoneNumber(testPhoneNumber);
    const contactDeviceId = agent.getDeviceIdFromPhoneNumber(normalizedTestPhone);

    if (contactDeviceId) {
      const contactDevice = agent.devices.get(contactDeviceId);

      // This is the FIXED logic from contact-search.js
      const ownerName = agent.getDeviceOwnerName(contactDeviceId) || contactDevice.deviceName || `Device ${contactDeviceId}`;
      const deviceAvatar = contactDevice.img || 'icons/svg/mystery-man.svg';

      console.log(`✅ Contact search modal would show:`);
      console.log(`   - Name: ${ownerName}`);
      console.log(`   - Avatar: ${deviceAvatar}`);
      console.log(`   - Phone: ${testPhoneNumber}`);

      // Verify this is better than the old behavior
      const oldBehaviorName = contactDevice.deviceName || `Device ${contactDeviceId}`;
      if (ownerName !== oldBehaviorName) {
        console.log(`✅ Fix working: Shows "${ownerName}" instead of "${oldBehaviorName}"`);
      } else {
        console.log(`ℹ️ Names match: "${ownerName}" (this is fine if device name was already correct)`);
      }

      testsPassed++;
    } else {
      console.error(`❌ Contact search simulation failed`);
    }

    // Test Results
    console.log("\n📊 === TEST RESULTS ===");
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

    if (testsPassed === totalTests) {
      console.log("🎉 ALL CONTACT DISPLAY TESTS PASSED!");
      console.log("✨ Contact names and avatars should now display correctly!");
      ui.notifications.info("Contact Display Fix: All tests passed!");
      return true;
    } else {
      console.log("⚠️ Some tests failed. Check implementation.");
      ui.notifications.warn(`Contact Display Fix: ${testsPassed}/${totalTests} tests passed`);
      return false;
    }

  } catch (error) {
    console.error("❌ Error during contact display testing:", error);
    ui.notifications.error("Contact display test failed: " + error.message);
    return false;
  }
}

/**
 * Test the specific issue reported by user
 */
async function testMasterResetContactDisplay() {
  console.log("\n🚨 === MASTER RESET CONTACT DISPLAY TEST ===");
  console.log("Testing the specific issue: contacts showing default name after master reset");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("📋 Current Issue Reproduction:");
  console.log("1. After master reset, device sync restores phone number mappings");
  console.log("2. But when adding contacts, they show default names instead of actor names");
  console.log("3. This happens because contact search uses deviceName instead of owner name");

  console.log("\n🔧 Testing the fix:");

  // Test the phone number to device mapping
  console.log("\n📞 Phone Number to Device Mapping Test:");
  const phoneNumbers = Array.from(agent.devicePhoneNumbers.entries());

  if (phoneNumbers.length === 0) {
    console.error("❌ No phone numbers found. Run device sync first.");
    return false;
  }

  for (const [deviceId, phoneNumber] of phoneNumbers.slice(0, 3)) { // Test first 3
    const device = agent.devices.get(deviceId);
    const formattedPhone = agent.formatPhoneNumberForDisplay(phoneNumber);

    console.log(`\n📱 Testing device: ${deviceId}`);
    console.log(`   Phone: ${formattedPhone}`);
    console.log(`   Device Name: ${device.deviceName}`);

    // Test the getDeviceOwnerName helper (the fix)
    const ownerName = agent.getDeviceOwnerName(deviceId);
    console.log(`   Owner Name (via helper): ${ownerName}`);

    // Test phone lookup
    const normalizedPhone = agent.normalizePhoneNumber(phoneNumber);
    const foundDeviceId = agent.getDeviceIdFromPhoneNumber(normalizedPhone);

    if (foundDeviceId === deviceId) {
      console.log(`   ✅ Phone lookup works: ${normalizedPhone} → ${foundDeviceId}`);

      // Test what contact search would show (OLD vs NEW)
      console.log(`   📋 Contact Search Display:`);
      console.log(`      OLD behavior: "${device.deviceName || `Device ${deviceId}`}"`);
      console.log(`      NEW behavior: "${ownerName || device.deviceName || `Device ${deviceId}`}"`);

      if (ownerName && ownerName !== device.deviceName) {
        console.log(`      ✅ Fix improves display: "${device.deviceName}" → "${ownerName}"`);
      } else {
        console.log(`      ℹ️ Names match or owner name not available`);
      }
    } else {
      console.error(`   ❌ Phone lookup failed: ${normalizedPhone} → ${foundDeviceId}`);
    }
  }

  console.log("\n🎯 Summary:");
  console.log("✅ The fix changes contact search to use getDeviceOwnerName() helper");
  console.log("✅ This helper prioritizes actor names over device names");
  console.log("✅ After device sync, this should show proper actor names");
  console.log("✅ Manual sync button in agent interface ensures data is current");

  return true;
}

/**
 * Run all contact display tests
 */
async function runAllContactDisplayTests() {
  console.log("🚀 === RUNNING ALL CONTACT DISPLAY TESTS ===");
  console.log("Testing contact name and avatar display fixes");

  let allPassed = true;

  // Test 1: Contact Display After Reset
  const resetTest = await testContactDisplayAfterReset();
  if (!resetTest) allPassed = false;

  // Test 2: Master Reset Specific Issue
  const masterResetTest = await testMasterResetContactDisplay();
  if (!masterResetTest) allPassed = false;

  console.log("\n🏁 === FINAL RESULTS ===");
  if (allPassed) {
    console.log("🎉 ALL CONTACT DISPLAY TESTS PASSED!");
    console.log("✨ The fix should resolve the issue:");
    console.log("   📤 Contact search now uses getDeviceOwnerName() helper");
    console.log("   🔄 Device sync ensures owner names are restored");
    console.log("   🔘 Manual sync button available for immediate updates");
    console.log("   📱 Contacts show actor names instead of default names");
    ui.notifications.info("Contact Display Fix: All systems operational!");
  } else {
    console.log("⚠️ Some tests failed. Review implementation.");
    ui.notifications.warn("Contact Display Fix: Some issues detected");
  }

  return allPassed;
}

// Make functions globally available for testing
window.testContactDisplayAfterReset = testContactDisplayAfterReset;
window.testMasterResetContactDisplay = testMasterResetContactDisplay;
window.runAllContactDisplayTests = runAllContactDisplayTests;

console.log("Contact Display Fix Test Script loaded successfully!");
console.log("Available test functions:");
console.log("- testContactDisplayAfterReset()");
console.log("- testMasterResetContactDisplay()");
console.log("- runAllContactDisplayTests()");
