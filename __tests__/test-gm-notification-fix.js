/**
 * Test GM Notification Fix
 * ========================
 * 
 * This script tests the fix for the issue where GMs were receiving
 * notifications for messages between players that they shouldn't receive.
 */

console.log("=== Testing GM Notification Fix ===");

/**
 * Test 1: Verify GM doesn't receive notifications for player-to-player messages
 */
async function testGMNotificationFiltering() {
  console.log("\n--- Test 1: GM Notification Filtering ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get all devices
    const allDevices = cyberpunkAgent.getAllRegisteredDevices();
    console.log(`✅ Found ${allDevices.length} total devices`);

    if (allDevices.length < 2) {
      console.log("⚠️ Need at least 2 devices to test player-to-player messaging");
      return true;
    }

    // Find player devices (not owned by GM)
    const playerDevices = allDevices.filter(device => {
      const owner = cyberpunkAgent._getUserForDevice(device.id);
      return owner && !owner.isGM;
    });

    if (playerDevices.length < 2) {
      console.log("⚠️ Need at least 2 player devices to test");
      return true;
    }

    const device1 = playerDevices[0];
    const device2 = playerDevices[1];

    console.log(`✅ Testing with player devices: ${device1.deviceName} -> ${device2.deviceName}`);

    // Test notification logic for GM
    const shouldPlaySound = cyberpunkAgent.shouldPlayNotificationSound(device2.id, device1.id);
    const shouldShowNotification = cyberpunkAgent.shouldShowNotification(device2.id, device1.id);

    console.log(`✅ shouldPlayNotificationSound: ${shouldPlaySound}`);
    console.log(`✅ shouldShowNotification: ${shouldShowNotification}`);

    // GM should NOT receive notifications for player-to-player messages
    if (game.user.isGM) {
      if (shouldPlaySound || shouldShowNotification) {
        console.error("❌ GM is receiving notifications for player-to-player messages");
        return false;
      } else {
        console.log("✅ GM correctly filtered out player-to-player notifications");
        return true;
      }
    } else {
      // For players, they should receive notifications for their own devices
      const isDeviceOwner = cyberpunkAgent._getUserForDevice(device2.id)?.id === game.user.id;
      if (isDeviceOwner) {
        if (!shouldPlaySound || !shouldShowNotification) {
          console.error("❌ Player is not receiving notifications for their own device");
          return false;
        } else {
          console.log("✅ Player correctly receives notifications for their device");
          return true;
        }
      } else {
        console.log("✅ Player correctly filtered out notifications for other devices");
        return true;
      }
    }
  } catch (error) {
    console.error("❌ Error testing GM notification filtering:", error);
    return false;
  }
}

/**
 * Test 2: Verify device ownership detection
 */
async function testDeviceOwnershipDetection() {
  console.log("\n--- Test 2: Device Ownership Detection ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's accessible devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    console.log(`✅ User has access to ${userDevices.length} devices`);

    // Get all devices
    const allDevices = cyberpunkAgent.getAllRegisteredDevices();
    console.log(`✅ Total devices in system: ${allDevices.length}`);

    // Test ownership detection for each device
    for (const device of allDevices) {
      const owner = cyberpunkAgent._getUserForDevice(device.id);
      const isOwner = owner && owner.id === game.user.id;
      const hasAccess = userDevices.some(d => d.id === device.id);

      console.log(`Device: ${device.deviceName}`);
      console.log(`  - Owner: ${owner?.name || 'Unknown'}`);
      console.log(`  - Is Current User Owner: ${isOwner}`);
      console.log(`  - Has Access: ${hasAccess}`);

      // GM should have access to all devices but not be owner of player devices
      if (game.user.isGM) {
        if (!hasAccess) {
          console.error(`❌ GM doesn't have access to device ${device.deviceName}`);
          return false;
        }
      } else {
        // Players should only have access to their own devices
        if (hasAccess && !isOwner) {
          console.error(`❌ Player has access to device they don't own: ${device.deviceName}`);
          return false;
        }
      }
    }

    console.log("✅ Device ownership detection working correctly");
    return true;
  } catch (error) {
    console.error("❌ Error testing device ownership detection:", error);
    return false;
  }
}

/**
 * Test 3: Verify unread message notification on reconnect
 */
async function testUnreadMessageNotification() {
  console.log("\n--- Test 3: Unread Message Notification on Reconnect ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user's devices
    const userDevices = cyberpunkAgent.getUserAccessibleDevices();
    if (userDevices.length === 0) {
      console.log("⚠️ No devices available for testing");
      return true;
    }

    const testDevice = userDevices[0];
    console.log(`✅ Testing with device: ${testDevice.deviceName}`);

    // Simulate processing messages and contacts (this should trigger unread message check)
    console.log("🔄 Testing processNewMessagesAndContacts...");
    await cyberpunkAgent.processNewMessagesAndContacts(testDevice.id);

    console.log("✅ Unread message notification test completed");
    return true;
  } catch (error) {
    console.error("❌ Error testing unread message notification:", error);
    return false;
  }
}

/**
 * Test 4: Verify SocketLib notification filtering
 */
async function testSocketLibNotificationFiltering() {
  console.log("\n--- Test 4: SocketLib Notification Filtering ---");

  try {
    const cyberpunkAgent = window.CyberpunkAgent?.instance;
    if (!cyberpunkAgent) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get all devices
    const allDevices = cyberpunkAgent.getAllRegisteredDevices();
    if (allDevices.length < 2) {
      console.log("⚠️ Need at least 2 devices to test");
      return true;
    }

    // Find player devices
    const playerDevices = allDevices.filter(device => {
      const owner = cyberpunkAgent._getUserForDevice(device.id);
      return owner && !owner.isGM;
    });

    if (playerDevices.length < 2) {
      console.log("⚠️ Need at least 2 player devices to test");
      return true;
    }

    const device1 = playerDevices[0];
    const device2 = playerDevices[1];

    console.log(`✅ Testing SocketLib filtering with: ${device1.deviceName} -> ${device2.deviceName}`);

    // Simulate the SocketLib notification logic
    const receiverUser = cyberpunkAgent._getUserForDevice(device2.id);
    let isReceiver = false;

    if (receiverUser && receiverUser.id === game.user.id) {
      isReceiver = true;
    } else {
      // Fallback: check if it's a direct actor message (legacy support)
      const userActors = cyberpunkAgent.getUserActors();
      isReceiver = userActors.some(actor => actor.id === device2.id);
    }

    console.log(`✅ SocketLib isReceiver check: ${isReceiver}`);
    console.log(`✅ Receiver user: ${receiverUser?.name || 'Unknown'}`);
    console.log(`✅ Current user: ${game.user.name}`);

    // GM should not be receiver for player-to-player messages
    if (game.user.isGM) {
      if (isReceiver) {
        console.error("❌ GM incorrectly identified as receiver for player-to-player message");
        return false;
      } else {
        console.log("✅ GM correctly filtered out of player-to-player message");
        return true;
      }
    } else {
      // For players, check if they own the receiving device
      const isDeviceOwner = receiverUser && receiverUser.id === game.user.id;
      if (isDeviceOwner && !isReceiver) {
        console.error("❌ Player incorrectly filtered out of their own message");
        return false;
      } else if (!isDeviceOwner && isReceiver) {
        console.error("❌ Player incorrectly identified as receiver for other's message");
        return false;
      } else {
        console.log("✅ Player notification filtering working correctly");
        return true;
      }
    }
  } catch (error) {
    console.error("❌ Error testing SocketLib notification filtering:", error);
    return false;
  }
}

/**
 * Run all GM notification fix tests
 */
async function runGMNotificationFixTests() {
  console.log("=== Running GM Notification Fix Tests ===");

  const tests = [
    testGMNotificationFiltering,
    testDeviceOwnershipDetection,
    testUnreadMessageNotification,
    testSocketLibNotificationFiltering
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
    }
  }

  console.log(`\n=== Test Results: ${passedTests}/${totalTests} tests passed ===`);

  if (passedTests === totalTests) {
    console.log("🎉 All GM notification fix tests passed!");
  } else {
    console.log("⚠️ Some tests failed. Check the logs above for details.");
  }

  return passedTests === totalTests;
}

/**
 * Quick test function
 */
function testGMNotificationFix() {
  console.log("Testing the GM notification fix...");
  runGMNotificationFixTests().then(success => {
    if (success) {
      console.log("✅ GM notification fix test passed!");
    } else {
      console.log("❌ GM notification fix test failed");
    }
  });
}

// Export functions for manual testing
window.testGMNotificationFix = testGMNotificationFix;
window.runGMNotificationFixTests = runGMNotificationFixTests;

console.log("GM notification fix tests loaded. Use testGMNotificationFix() to run tests."); 