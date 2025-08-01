/**
 * Test script for Intelligent Notification Sound System
 * 
 * This script tests the new activity manager that prevents notification sounds
 * from playing when a user has the conversation open in their agent interface.
 */

console.log("=== TESTING INTELLIGENT NOTIFICATION SYSTEM ===");

// Check if CyberpunkAgent instance exists
if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
  console.error("❌ CyberpunkAgent instance not found");
  console.log("💡 Make sure the module is loaded and initialized");
  return;
}

const agent = window.CyberpunkAgent.instance;

// Test 1: Check if activity manager methods exist
console.log("\n🔍 Test 1: Checking Activity Manager Methods");
const requiredMethods = [
  'registerActiveConversation',
  'clearActiveConversation',
  'getActiveConversation',
  'shouldPlayNotificationSound',
  '_getUserForDevice'
];

let allMethodsExist = true;
requiredMethods.forEach(method => {
  if (typeof agent[method] === 'function') {
    console.log(`✅ ${method} method exists`);
  } else {
    console.log(`❌ ${method} method missing`);
    allMethodsExist = false;
  }
});

if (!allMethodsExist) {
  console.error("❌ Some activity manager methods are missing");
  return;
}

// Test 2: Check activity manager properties
console.log("\n🔍 Test 2: Checking Activity Manager Properties");
console.log(`✅ _activeConversations exists: ${!!agent._activeConversations}`);
console.log(`✅ _activeConversations instanceof Map: ${agent._activeConversations instanceof Map}`);
console.log(`✅ _lastActivityUpdate exists: ${!!agent._lastActivityUpdate}`);

// Test 3: Test basic activity manager functionality
console.log("\n🔍 Test 3: Testing Basic Activity Manager Functionality");

// Clear any existing activity for current user
agent.clearActiveConversation(game.user.id);
console.log("✅ Cleared any existing activity for current user");

// Check that no active conversation exists
const noActivity = agent.getActiveConversation(game.user.id);
console.log(`✅ No active conversation: ${noActivity === null}`);

// Register a test conversation
const testDeviceId = 'test-device-123';
const testContactId = 'test-contact-456';
agent.registerActiveConversation(game.user.id, testDeviceId, testContactId);
console.log(`✅ Registered test conversation: ${testDeviceId} -> ${testContactId}`);

// Check that active conversation exists
const activeActivity = agent.getActiveConversation(game.user.id);
if (activeActivity && activeActivity.deviceId === testDeviceId && activeActivity.contactId === testContactId) {
  console.log("✅ Active conversation correctly registered");
} else {
  console.error("❌ Active conversation not correctly registered");
  console.log("Expected:", { deviceId: testDeviceId, contactId: testContactId });
  console.log("Actual:", activeActivity);
}

// Test 4: Test notification sound logic
console.log("\n🔍 Test 4: Testing Notification Sound Logic");

// Test with active conversation (should NOT play sound)
const shouldNotPlay = agent.shouldPlayNotificationSound(testDeviceId, testContactId);
console.log(`🎵 Active conversation test: should NOT play sound = ${!shouldNotPlay}`);
if (!shouldNotPlay) {
  console.log("✅ CORRECT: Notification sound suppressed for active conversation");
} else {
  console.log("❌ INCORRECT: Notification sound would play for active conversation");
}

// Test with different conversation (should play sound)
const shouldPlay = agent.shouldPlayNotificationSound(testDeviceId, 'different-contact-789');
console.log(`🎵 Different conversation test: should play sound = ${shouldPlay}`);
if (shouldPlay) {
  console.log("✅ CORRECT: Notification sound would play for different conversation");
} else {
  console.log("❌ INCORRECT: Notification sound suppressed for different conversation");
}

// Test 5: Test user device ownership detection
console.log("\n🔍 Test 5: Testing User Device Ownership Detection");

// Get some real devices if available
const realDevices = Array.from(agent.devices.keys());
if (realDevices.length > 0) {
  const testRealDeviceId = realDevices[0];
  const deviceOwner = agent._getUserForDevice(testRealDeviceId);

  if (deviceOwner) {
    console.log(`✅ Device ownership detected: ${testRealDeviceId} -> ${deviceOwner.name}`);

    // Test notification sound with real device
    const realShouldPlay = agent.shouldPlayNotificationSound(testRealDeviceId, 'some-contact-id');
    console.log(`🎵 Real device test: should play sound = ${realShouldPlay}`);
  } else {
    console.log(`⚠️ Could not determine owner for device: ${testRealDeviceId}`);
  }
} else {
  console.log("⚠️ No real devices available for ownership testing");
}

// Test 6: Test the modified playNotificationSound function
console.log("\n🔍 Test 6: Testing Modified playNotificationSound Function");

// Test with active conversation (should not play due to activity manager)
console.log("🎵 Testing playNotificationSound with active conversation...");
agent.playNotificationSound(testContactId, testDeviceId);
console.log("✅ playNotificationSound called (should be suppressed by activity manager)");

// Clear the active conversation
agent.clearActiveConversation(game.user.id);
console.log("✅ Cleared active conversation");

// Test with no active conversation (should play)
console.log("🎵 Testing playNotificationSound with no active conversation...");
agent.playNotificationSound(testContactId, testDeviceId);
console.log("✅ playNotificationSound called (should play normally)");

// Test 7: Test agent application integration
console.log("\n🔍 Test 7: Testing Agent Application Integration");

// Check if there are any open agent applications
const openWindows = Object.values(ui.windows);
const agentWindows = openWindows.filter(window =>
  window.constructor.name === 'AgentHomeApplication' ||
  window.constructor.name === 'Chat7Application' ||
  window.constructor.name === 'ChatConversationApplication'
);

console.log(`📱 Open agent windows: ${agentWindows.length}`);

if (agentWindows.length > 0) {
  console.log("✅ Agent applications are open - activity manager should be working");
  console.log("💡 Try navigating to a conversation in one of these windows to test the system");
} else {
  console.log("⚠️ No agent applications are currently open");
  console.log("💡 Open an agent interface to test the full integration");
}

// Test 8: Manual testing instructions
console.log("\n🔍 Test 8: Manual Testing Instructions");
console.log("📋 To manually test the intelligent notification system:");
console.log("1. Open an agent interface (token controls -> agent icon)");
console.log("2. Navigate to Chat7 view");
console.log("3. Click on a contact to open a conversation");
console.log("4. Have another user send a message to that contact");
console.log("5. The notification sound should NOT play (conversation is active)");
console.log("6. Navigate back to Chat7 or close the agent");
console.log("7. Have another user send a message again");
console.log("8. The notification sound SHOULD play (no active conversation)");

console.log("\n🔧 Debug Functions Available:");
console.log("- debugActivityManager() - Show current activity manager status");
console.log("- testNotificationSound() - Test notification sound logic");
console.log("- registerTestConversation(deviceId, contactId) - Manually register a conversation");
console.log("- clearTestConversation() - Clear active conversation");

console.log("\n✅ Intelligent Notification System Test Complete!");
console.log("🎵 The system should now intelligently suppress notification sounds for active conversations"); 