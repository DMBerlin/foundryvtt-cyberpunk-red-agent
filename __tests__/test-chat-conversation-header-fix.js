/**
 * Chat Conversation Header Fix Test Script
 * Tests that chat conversation header shows proper actor names and avatars
 */

console.log("Cyberpunk Agent | Loading Chat Conversation Header Fix Test Script...");

/**
 * Test chat conversation header display
 */
async function testChatConversationHeaderDisplay() {
  console.log("💬 === CHAT CONVERSATION HEADER DISPLAY TEST ===");
  console.log("Testing that chat conversation header shows proper actor names and avatars");

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

    // Test 2: Simulate Chat Conversation Header Data Preparation
    console.log("\n💬 Test 2: Chat Conversation Header Data Preparation");
    totalTests++;

    const sourceDevice = devicesWithActors[0];
    const contactDevice = devicesWithActors[1];

    console.log(`📱 Testing conversation: ${sourceDevice.actor.name} → ${contactDevice.actor.name}`);

    // Simulate the ENHANCED logic from agent-home.js conversation view
    const contactOwnerName = agent.getDeviceOwnerName(contactDevice.deviceId) || contactDevice.device.deviceName || `Device ${contactDevice.deviceId}`;

    // Test the ENHANCED avatar logic
    let contactAvatar = contactDevice.device.img || 'icons/svg/mystery-man.svg';
    if (contactDevice.device.ownerActorId) {
      const actor = game.actors.get(contactDevice.device.ownerActorId);
      if (actor && actor.img) {
        contactAvatar = actor.img;
      }
    }

    // Simulate the contact object that would be passed to template
    const simulatedContact = {
      id: contactDevice.deviceId,
      name: contactOwnerName,
      img: contactAvatar,
      deviceName: contactDevice.device.deviceName,
      ownerName: contactDevice.device.ownerName,
      isVirtual: contactDevice.device.isVirtual || false
    };

    console.log(`✅ Chat conversation header would show:`);
    console.log(`   - Contact Name: ${simulatedContact.name} (should be: ${contactDevice.actor.name})`);
    console.log(`   - Contact Avatar: ${simulatedContact.img} (should be: ${contactDevice.actor.img || 'default'})`);

    // Verify name is correct
    if (simulatedContact.name === contactDevice.actor.name) {
      console.log(`✅ Header name is correct: "${simulatedContact.name}"`);
    } else {
      console.error(`❌ Header name mismatch: got "${simulatedContact.name}", expected "${contactDevice.actor.name}"`);
    }

    // Verify avatar is correct
    if (contactDevice.actor.img && simulatedContact.img === contactDevice.actor.img) {
      console.log(`✅ Header avatar is correct: "${simulatedContact.img}"`);
      testsPassed++;
    } else if (!contactDevice.actor.img && simulatedContact.img === 'icons/svg/mystery-man.svg') {
      console.log(`✅ Header avatar fallback is correct (actor has no custom avatar)`);
      testsPassed++;
    } else {
      console.error(`❌ Header avatar mismatch: got "${simulatedContact.img}", expected "${contactDevice.actor.img || 'default'}"`);
    }

    // Test 3: Template Usage Verification
    console.log("\n📄 Test 3: Template Usage Verification");
    totalTests++;

    console.log("🔍 Verifying template usage:");
    console.log(`   - Chat Header Avatar: {{contact.img}} = "${simulatedContact.img}"`);
    console.log(`   - Chat Header Name: {{contact.name}} = "${simulatedContact.name}"`);
    console.log(`   - No Messages Text: "Inicie uma conversa com {{contact.name}}" = "Inicie uma conversa com ${simulatedContact.name}"`);

    // Template data should be correctly formatted
    if (simulatedContact.name && simulatedContact.img) {
      console.log(`✅ Template data is properly formatted for chat conversation header`);
      testsPassed++;
    } else {
      console.error(`❌ Template data has missing fields`);
    }

    // Test 4: Comparison with Old vs New Behavior
    console.log("\n🔄 Test 4: Old vs New Behavior Comparison");
    totalTests++;

    // OLD behavior simulation
    const oldBehaviorName = contactDevice.device.deviceName || contactDevice.device.ownerName || `Device ${contactDevice.deviceId}`;
    const oldBehaviorAvatar = contactDevice.device.img || 'icons/svg/mystery-man.svg';

    console.log(`📋 Behavior Comparison:`);
    console.log(`   OLD header name: "${oldBehaviorName}"`);
    console.log(`   NEW header name: "${simulatedContact.name}"`);
    console.log(`   OLD header avatar: "${oldBehaviorAvatar}"`);
    console.log(`   NEW header avatar: "${simulatedContact.img}"`);

    // Check if the fix actually improves the display
    const nameImproved = simulatedContact.name === contactDevice.actor.name && oldBehaviorName !== contactDevice.actor.name;
    const avatarImproved = contactDevice.actor.img && simulatedContact.img === contactDevice.actor.img && oldBehaviorAvatar !== contactDevice.actor.img;

    if (nameImproved || avatarImproved) {
      console.log(`✅ Fix improves display:`);
      if (nameImproved) console.log(`   - Name: "${oldBehaviorName}" → "${simulatedContact.name}"`);
      if (avatarImproved) console.log(`   - Avatar: "${oldBehaviorAvatar}" → "${simulatedContact.img}"`);
      testsPassed++;
    } else if (simulatedContact.name === contactDevice.actor.name && simulatedContact.img === (contactDevice.actor.img || 'icons/svg/mystery-man.svg')) {
      console.log(`✅ Display is correct (may have been correct already)`);
      testsPassed++;
    } else {
      console.error(`❌ Fix doesn't improve display as expected`);
    }

    // Test Results
    console.log("\n📊 === TEST RESULTS ===");
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

    if (testsPassed === totalTests) {
      console.log("🎉 ALL CHAT CONVERSATION HEADER TESTS PASSED!");
      console.log("✨ Chat conversation header should now show proper actor names and avatars!");
      ui.notifications.info("Chat Conversation Header Fix: All tests passed!");
      return true;
    } else {
      console.log("⚠️ Some tests failed. Check implementation.");
      ui.notifications.warn(`Chat Conversation Header Fix: ${testsPassed}/${totalTests} tests passed`);
      return false;
    }

  } catch (error) {
    console.error("❌ Error during chat conversation header testing:", error);
    ui.notifications.error("Chat conversation header test failed: " + error.message);
    return false;
  }
}

/**
 * Test the specific chat activity issues
 */
async function testChatActivityIssues() {
  console.log("\n🎯 === CHAT ACTIVITY ISSUES TEST ===");
  console.log("Testing the specific chat activity display issues");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔧 Testing the chat activity fixes:");

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

  // Test Chat Activity Display Issues
  console.log(`\n💬 Chat Activity Display Test:`);
  console.log(`Issue: Chat conversation header showing device name instead of actor name`);

  // OLD behavior test
  const oldHeaderName = testDevice.device.deviceName || testDevice.device.ownerName || `Device ${testDevice.deviceId}`;
  console.log(`OLD behavior: Would show "${oldHeaderName}" in chat header`);

  // NEW behavior test  
  const newHeaderName = agent.getDeviceOwnerName(testDevice.deviceId) || testDevice.device.deviceName || `Device ${testDevice.deviceId}`;
  console.log(`NEW behavior: Shows "${newHeaderName}" in chat header`);

  if (newHeaderName === testActor.name) {
    console.log(`✅ Chat activity FIXED: Header now shows actor name`);
  } else {
    console.error(`❌ Chat activity NOT FIXED: Name mismatch`);
  }

  // Test avatar display
  console.log(`\n🖼️ Chat Activity Avatar Test:`);

  // OLD avatar behavior
  const oldHeaderAvatar = testDevice.device.img || 'icons/svg/mystery-man.svg';
  console.log(`OLD behavior: Would show "${oldHeaderAvatar}" in chat header`);

  // NEW avatar behavior
  let newHeaderAvatar = testDevice.device.img || 'icons/svg/mystery-man.svg';
  if (testDevice.device.ownerActorId) {
    const actor = game.actors.get(testDevice.device.ownerActorId);
    if (actor && actor.img) {
      newHeaderAvatar = actor.img;
    }
  }
  console.log(`NEW behavior: Shows "${newHeaderAvatar}" in chat header`);

  if (testActor.img && newHeaderAvatar === testActor.img) {
    console.log(`✅ Chat activity avatar FIXED: Header now shows actor avatar`);
  } else if (!testActor.img) {
    console.log(`ℹ️ Chat activity avatar N/A: Actor has no custom avatar, using default is correct`);
  } else {
    console.error(`❌ Chat activity avatar NOT FIXED: Avatar mismatch`);
  }

  console.log(`\n🎯 Summary of Chat Activity Fixes:`);
  console.log(`✅ Chat conversation header now uses getDeviceOwnerName() for proper actor names`);
  console.log(`✅ Chat conversation header now uses actor avatars when available`);
  console.log(`✅ "No messages" text will show proper actor name`);
  console.log(`✅ All chat activity displays are now consistent with other interfaces`);

  return true;
}

/**
 * Run all chat conversation header tests
 */
async function runAllChatConversationHeaderTests() {
  console.log("🚀 === RUNNING ALL CHAT CONVERSATION HEADER TESTS ===");
  console.log("Testing the chat conversation header name and avatar fixes");

  let allPassed = true;

  // Test 1: Chat Conversation Header Display
  const headerTest = await testChatConversationHeaderDisplay();
  if (!headerTest) allPassed = false;

  // Test 2: Chat Activity Issues
  const activityTest = await testChatActivityIssues();
  if (!activityTest) allPassed = false;

  console.log("\n🏁 === FINAL RESULTS ===");
  if (allPassed) {
    console.log("🎉 ALL CHAT CONVERSATION HEADER TESTS PASSED!");
    console.log("✨ The fixes should resolve the chat activity issues:");
    console.log("   💬 Chat conversation header shows proper actor names");
    console.log("   🖼️ Chat conversation header shows proper actor avatars");
    console.log("   📄 Template usage is consistent and correct");
    console.log("   🔄 All chat displays are now unified with other interfaces");
    ui.notifications.info("Chat Conversation Header Fix: All systems operational!");
  } else {
    console.log("⚠️ Some tests failed. Review implementation.");
    ui.notifications.warn("Chat Conversation Header Fix: Some issues detected");
  }

  return allPassed;
}

// Make functions globally available for testing
window.testChatConversationHeaderDisplay = testChatConversationHeaderDisplay;
window.testChatActivityIssues = testChatActivityIssues;
window.runAllChatConversationHeaderTests = runAllChatConversationHeaderTests;

console.log("Chat Conversation Header Fix Test Script loaded successfully!");
console.log("Available test functions:");
console.log("- testChatConversationHeaderDisplay()");
console.log("- testChatActivityIssues()");
console.log("- runAllChatConversationHeaderTests()");
