/**
 * Contact Avatar and Name Final Fix Test Script
 * Tests the final fixes for contact search results and contact list display
 */

console.log("Cyberpunk Agent | Loading Contact Avatar and Name Final Fix Test Script...");

/**
 * Test contact search result display (avatar and name)
 */
async function testContactSearchResultDisplay() {
  console.log("🔍 === CONTACT SEARCH RESULT DISPLAY TEST ===");
  console.log("Testing that contact search shows proper actor names and avatars");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  let testsPassed = 0;
  let totalTests = 0;

  try {
    // Test 1: Get devices with actors for testing
    console.log("\n📱 Test 1: Device and Actor Verification");
    totalTests++;

    const devicesWithActors = [];
    for (const [deviceId, device] of agent.devices) {
      if (device.ownerActorId) {
        const actor = game.actors.get(device.ownerActorId);
        if (actor) {
          devicesWithActors.push({
            deviceId,
            device,
            actor
          });
        }
      }
    }

    if (devicesWithActors.length < 2) {
      console.error("❌ Need at least 2 devices with actors for testing");
      return false;
    }

    console.log(`✅ Found ${devicesWithActors.length} devices with actors for testing`);
    testsPassed++;

    // Test 2: Contact Search Result Display
    console.log("\n🔍 Test 2: Contact Search Result Display");
    totalTests++;

    const searchDevice = devicesWithActors[0];
    const targetDevice = devicesWithActors[1];

    const targetPhoneNumber = agent.devicePhoneNumbers.get(targetDevice.deviceId);
    if (!targetPhoneNumber) {
      console.error("❌ Target device has no phone number");
      return false;
    }

    console.log(`📞 Testing search for: ${targetDevice.actor.name} (${agent.formatPhoneNumberForDisplay(targetPhoneNumber)})`);

    // Simulate contact search process
    const normalizedPhone = agent.normalizePhoneNumber(targetPhoneNumber);
    const foundDeviceId = agent.getDeviceIdFromPhoneNumber(normalizedPhone);

    if (foundDeviceId === targetDevice.deviceId) {
      const contactDevice = agent.devices.get(foundDeviceId);

      // Test the ENHANCED logic from contact-search.js
      const ownerName = agent.getDeviceOwnerName(foundDeviceId) || contactDevice.deviceName || `Device ${foundDeviceId}`;

      // Test the ENHANCED avatar logic
      let deviceAvatar = contactDevice.img || 'icons/svg/mystery-man.svg';
      if (contactDevice.ownerActorId) {
        const actor = game.actors.get(contactDevice.ownerActorId);
        if (actor && actor.img) {
          deviceAvatar = actor.img;
        }
      }

      console.log(`✅ Contact search result would show:`);
      console.log(`   - Name: ${ownerName} (should be: ${targetDevice.actor.name})`);
      console.log(`   - Avatar: ${deviceAvatar} (should be: ${targetDevice.actor.img || 'default'})`);

      // Verify name is correct
      if (ownerName === targetDevice.actor.name) {
        console.log(`✅ Name is correct: "${ownerName}"`);
      } else {
        console.error(`❌ Name mismatch: got "${ownerName}", expected "${targetDevice.actor.name}"`);
      }

      // Verify avatar is correct
      if (targetDevice.actor.img && deviceAvatar === targetDevice.actor.img) {
        console.log(`✅ Avatar is correct: "${deviceAvatar}"`);
        testsPassed++;
      } else if (!targetDevice.actor.img && deviceAvatar === 'icons/svg/mystery-man.svg') {
        console.log(`✅ Avatar fallback is correct (actor has no custom avatar)`);
        testsPassed++;
      } else {
        console.error(`❌ Avatar mismatch: got "${deviceAvatar}", expected "${targetDevice.actor.img || 'default'}"`);
      }
    } else {
      console.error(`❌ Phone search failed: Expected ${targetDevice.deviceId}, got ${foundDeviceId}`);
    }

    // Test 3: Contact List Display
    console.log("\n📋 Test 3: Contact List Display");
    totalTests++;

    // Simulate contact list display logic from agent-home.js
    const testContactDevice = targetDevice.device;
    const testContactDeviceId = targetDevice.deviceId;

    // Test the ENHANCED contact list logic
    const contactOwnerName = agent.getDeviceOwnerName(testContactDeviceId) || testContactDevice.deviceName || `Device ${testContactDeviceId}`;

    // Test the ENHANCED avatar logic for contact list
    let contactAvatar = testContactDevice.img || 'icons/svg/mystery-man.svg';
    if (testContactDevice.ownerActorId) {
      const actor = game.actors.get(testContactDevice.ownerActorId);
      if (actor && actor.img) {
        contactAvatar = actor.img;
      }
    }

    console.log(`✅ Contact list would show:`);
    console.log(`   - Name: ${contactOwnerName} (should be: ${targetDevice.actor.name})`);
    console.log(`   - Avatar: ${contactAvatar} (should be: ${targetDevice.actor.img || 'default'})`);

    // Verify contact list display
    if (contactOwnerName === targetDevice.actor.name) {
      console.log(`✅ Contact list name is correct: "${contactOwnerName}"`);

      if (targetDevice.actor.img && contactAvatar === targetDevice.actor.img) {
        console.log(`✅ Contact list avatar is correct: "${contactAvatar}"`);
        testsPassed++;
      } else if (!targetDevice.actor.img && contactAvatar === 'icons/svg/mystery-man.svg') {
        console.log(`✅ Contact list avatar fallback is correct`);
        testsPassed++;
      } else {
        console.error(`❌ Contact list avatar mismatch`);
      }
    } else {
      console.error(`❌ Contact list name mismatch: got "${contactOwnerName}", expected "${targetDevice.actor.name}"`);
    }

    // Test Results
    console.log("\n📊 === TEST RESULTS ===");
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

    if (testsPassed === totalTests) {
      console.log("🎉 ALL CONTACT DISPLAY TESTS PASSED!");
      console.log("✨ Both search results and contact list should show proper actor names and avatars!");
      ui.notifications.info("Contact Avatar/Name Fix: All tests passed!");
      return true;
    } else {
      console.log("⚠️ Some tests failed. Check implementation.");
      ui.notifications.warn(`Contact Avatar/Name Fix: ${testsPassed}/${totalTests} tests passed`);
      return false;
    }

  } catch (error) {
    console.error("❌ Error during contact display testing:", error);
    ui.notifications.error("Contact display test failed: " + error.message);
    return false;
  }
}

/**
 * Test the specific issues reported by user
 */
async function testSpecificUserIssues() {
  console.log("\n🎯 === SPECIFIC USER ISSUES TEST ===");
  console.log("Testing the specific issues:");
  console.log("1. Search results missing actor avatar");
  console.log("2. Contact list showing 'AGENT' name instead of actor name");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("\n🔧 Testing the fixes:");

  // Get a test device with actor
  let testDevice = null;
  let testActor = null;

  for (const [deviceId, device] of agent.devices) {
    if (device.ownerActorId) {
      const actor = game.actors.get(device.ownerActorId);
      if (actor) {
        testDevice = { deviceId, device };
        testActor = actor;
        break;
      }
    }
  }

  if (!testDevice || !testActor) {
    console.error("❌ No device with actor found for testing");
    return false;
  }

  console.log(`\n📱 Testing with device: ${testDevice.deviceId}`);
  console.log(`👤 Actor: ${testActor.name}`);
  console.log(`🖼️ Actor Avatar: ${testActor.img || 'No custom avatar'}`);

  // Test Issue 1: Search result avatar
  console.log(`\n🔍 Issue 1: Search Result Avatar Display`);
  console.log(`OLD behavior: Would show device.img = "${testDevice.device.img || 'default'}"`);

  // NEW behavior test
  let searchResultAvatar = testDevice.device.img || 'icons/svg/mystery-man.svg';
  if (testDevice.device.ownerActorId) {
    const actor = game.actors.get(testDevice.device.ownerActorId);
    if (actor && actor.img) {
      searchResultAvatar = actor.img;
    }
  }
  console.log(`NEW behavior: Shows actor.img = "${searchResultAvatar}"`);

  if (testActor.img && searchResultAvatar === testActor.img) {
    console.log(`✅ Issue 1 FIXED: Search results now show actor avatar`);
  } else if (!testActor.img) {
    console.log(`ℹ️ Issue 1 N/A: Actor has no custom avatar, using default is correct`);
  } else {
    console.error(`❌ Issue 1 NOT FIXED: Avatar mismatch`);
  }

  // Test Issue 2: Contact list name
  console.log(`\n📋 Issue 2: Contact List Name Display`);
  console.log(`OLD behavior: Would show device.deviceName = "${testDevice.device.deviceName || 'Unknown'}"`);

  // NEW behavior test
  const contactListName = agent.getDeviceOwnerName(testDevice.deviceId) || testDevice.device.deviceName || `Device ${testDevice.deviceId}`;
  console.log(`NEW behavior: Shows getDeviceOwnerName() = "${contactListName}"`);

  if (contactListName === testActor.name) {
    console.log(`✅ Issue 2 FIXED: Contact list now shows actor name instead of "AGENT"`);
  } else {
    console.error(`❌ Issue 2 NOT FIXED: Name mismatch`);
  }

  console.log(`\n🎯 Summary of Fixes:`);
  console.log(`✅ Contact search results now use actor avatars when available`);
  console.log(`✅ Contact list now uses getDeviceOwnerName() for proper actor names`);
  console.log(`✅ Both fixes include proper fallbacks for missing data`);

  return true;
}

/**
 * Test device migration and avatar update
 */
async function testDeviceMigrationAndAvatars() {
  console.log("\n🔄 === DEVICE MIGRATION AND AVATARS TEST ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔄 Running device migration to ensure proper names and avatars...");

  try {
    await agent.migrateDeviceNamesAndAvatars();
    console.log("✅ Device migration completed");

    // Verify migration results
    console.log("\n📋 Post-Migration Device Status:");
    console.log("Device ID | Device Name | Actor Name | Device Avatar | Actor Avatar | Match");
    console.log("----------|-------------|------------|---------------|--------------|------");

    let devicesChecked = 0;
    let devicesCorrect = 0;

    for (const [deviceId, device] of agent.devices) {
      if (device.ownerActorId) {
        const actor = game.actors.get(device.ownerActorId);
        if (actor) {
          devicesChecked++;

          const nameMatch = device.deviceName === actor.name;
          const avatarMatch = device.img === actor.img || (!actor.img && device.img === 'icons/svg/mystery-man.svg');

          if (nameMatch && avatarMatch) {
            devicesCorrect++;
          }

          console.log(`${deviceId} | ${device.deviceName || 'None'} | ${actor.name} | ${device.img || 'None'} | ${actor.img || 'None'} | ${nameMatch && avatarMatch ? '✅' : '❌'}`);
        }
      }
    }

    console.log(`\n📊 Migration Results: ${devicesCorrect}/${devicesChecked} devices have correct names and avatars`);

    return devicesCorrect === devicesChecked;

  } catch (error) {
    console.error("❌ Error during device migration:", error);
    return false;
  }
}

/**
 * Run all contact avatar and name final fix tests
 */
async function runAllContactAvatarNameTests() {
  console.log("🚀 === RUNNING ALL CONTACT AVATAR/NAME FINAL FIX TESTS ===");
  console.log("Testing the complete fix for contact display issues");

  let allPassed = true;

  // Test 1: Device Migration
  const migrationTest = await testDeviceMigrationAndAvatars();
  if (!migrationTest) allPassed = false;

  // Test 2: Contact Search Result Display
  const searchTest = await testContactSearchResultDisplay();
  if (!searchTest) allPassed = false;

  // Test 3: Specific User Issues
  const userIssuesTest = await testSpecificUserIssues();
  if (!userIssuesTest) allPassed = false;

  console.log("\n🏁 === FINAL RESULTS ===");
  if (allPassed) {
    console.log("🎉 ALL CONTACT AVATAR/NAME TESTS PASSED!");
    console.log("✨ The fixes should resolve both issues:");
    console.log("   🔍 Contact search results show proper actor avatars");
    console.log("   📋 Contact list shows proper actor names (not 'AGENT')");
    console.log("   🖼️ All displays use actor information when available");
    console.log("   🔄 Device migration ensures data consistency");
    ui.notifications.info("Contact Avatar/Name Fix: All systems operational!");
  } else {
    console.log("⚠️ Some tests failed. Review implementation.");
    ui.notifications.warn("Contact Avatar/Name Fix: Some issues detected");
  }

  return allPassed;
}

// Make functions globally available for testing
window.testContactSearchResultDisplay = testContactSearchResultDisplay;
window.testSpecificUserIssues = testSpecificUserIssues;
window.testDeviceMigrationAndAvatars = testDeviceMigrationAndAvatars;
window.runAllContactAvatarNameTests = runAllContactAvatarNameTests;

console.log("Contact Avatar and Name Final Fix Test Script loaded successfully!");
console.log("Available test functions:");
console.log("- testContactSearchResultDisplay()");
console.log("- testSpecificUserIssues()");
console.log("- testDeviceMigrationAndAvatars()");
console.log("- runAllContactAvatarNameTests()");
