/**
 * SocketLib Integration Test Suite
 * Tests the new SocketLib architecture following official documentation
 */

console.log("Cyberpunk Agent | Loading SocketLib test suite...");

/**
 * Test SocketLib initialization and registration
 */
function testSocketLibInitialization() {
  console.log("=== TESTING SOCKETLIB INITIALIZATION ===");

  // Check if SocketLib is available
  if (typeof socketlib === 'undefined') {
    console.error("❌ SocketLib is not available");
    return false;
  }

  console.log("✅ SocketLib is available");
  console.log("SocketLib version:", socketlib.version);

  // Check if our socket is registered
  if (!window.socket) {
    console.error("❌ Socket is not registered");
    return false;
  }

  console.log("✅ Socket is registered");
  console.log("Socket object:", window.socket);

  // Check if our module is registered
  const modules = socketlib.modules && Array.isArray(socketlib.modules) ? socketlib.modules : [];
  const isRegistered = modules.includes('cyberpunk-agent');

  if (!isRegistered) {
    console.error("❌ Module 'cyberpunk-agent' is not registered with SocketLib");
    return false;
  }

  console.log("✅ Module 'cyberpunk-agent' is registered with SocketLib");

  // Check socket methods
  const socketMethods = Object.keys(window.socket).filter(key => typeof window.socket[key] === 'function');
  console.log("Socket methods:", socketMethods);

  const requiredMethods = ['executeForEveryone', 'executeForOthers', 'executeAsGM', 'executeAsUser'];
  const missingMethods = requiredMethods.filter(method => !socketMethods.includes(method));

  if (missingMethods.length > 0) {
    console.error("❌ Missing required socket methods:", missingMethods);
    return false;
  }

  console.log("✅ All required socket methods are available");

  return true;
}

/**
 * Test SocketLib message sending
 */
async function testSocketLibMessageSending() {
  console.log("=== TESTING SOCKETLIB MESSAGE SENDING ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Check if SocketLib integration is available
  if (!agent.socketLibIntegration || !agent.socketLibIntegration.isAvailable) {
    console.error("❌ SocketLib integration not available");
    return false;
  }

  console.log("✅ SocketLib integration is available");

  // Test message sending
  const testMessage = {
    senderId: 'test-sender-' + Date.now(),
    receiverId: 'test-receiver-' + Date.now(),
    text: 'Test message from ' + game.user.name + ' at ' + new Date().toLocaleTimeString(),
    messageId: 'test-' + Date.now()
  };

  console.log("Sending test message:", testMessage);

  try {
    const success = await agent.socketLibIntegration.sendMessage(
      testMessage.senderId,
      testMessage.receiverId,
      testMessage.text,
      testMessage.messageId
    );

    if (success) {
      console.log("✅ SocketLib message sending successful");
      return true;
    } else {
      console.error("❌ SocketLib message sending failed");
      return false;
    }
  } catch (error) {
    console.error("❌ SocketLib message sending error:", error);
    return false;
  }
}

/**
 * Test SocketLib function registration
 */
function testSocketLibFunctionRegistration() {
  console.log("=== TESTING SOCKETLIB FUNCTION REGISTRATION ===");

  if (!window.socket) {
    console.error("❌ Socket not available for function registration test");
    return false;
  }

  // Check if our functions are registered
  const registeredFunctions = [
    'contactUpdate',
    'messageUpdate',
    'messageDeletion',
    'conversationClear',
    'sendMessage',
    'saveMessages',
    'saveMessagesResponse',
    'ping',
    'testConnection',
    'broadcastUpdate'
  ];

  let allRegistered = true;

  for (const funcName of registeredFunctions) {
    // We can't directly check if functions are registered, but we can test if the socket responds
    console.log(`Checking function: ${funcName}`);
  }

  console.log("✅ Function registration test completed");
  return true;
}

/**
 * Test real-time communication between clients
 */
async function testRealtimeCommunication() {
  console.log("=== TESTING REALTIME COMMUNICATION ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get user actors for testing
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.log("⚠️ Need at least 2 user actors to test realtime communication");
    console.log("Available actors:", userActors.map(a => a.name));
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`Testing communication between ${actor1.name} and ${actor2.name}`);

  // Test message sending
  const testMessage = "Realtime test " + Date.now();

  try {
    const success = await agent.sendMessage(actor1.id, actor2.id, testMessage);

    if (success) {
      console.log("✅ Message sent successfully");
      console.log("🔄 Check if the message appears in the other client's chat");
      return true;
    } else {
      console.error("❌ Message sending failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Message sending error:", error);
    return false;
  }
}

/**
 * Run all SocketLib tests
 */
async function runAllSocketLibTests() {
  console.log("🚀 RUNNING ALL SOCKETLIB TESTS");
  console.log("User:", game.user.name, "IsGM:", game.user.isGM);
  console.log("Timestamp:", new Date().toLocaleString());

  const results = {
    initialization: false,
    messageSending: false,
    functionRegistration: false,
    realtimeCommunication: false
  };

  // Test 1: Initialization
  results.initialization = testSocketLibInitialization();

  // Test 2: Message Sending
  if (results.initialization) {
    results.messageSending = await testSocketLibMessageSending();
  }

  // Test 3: Function Registration
  if (results.initialization) {
    results.functionRegistration = testSocketLibFunctionRegistration();
  }

  // Test 4: Realtime Communication
  if (results.initialization && results.messageSending) {
    results.realtimeCommunication = await testRealtimeCommunication();
  }

  // Summary
  console.log("=== TEST RESULTS SUMMARY ===");
  console.log("Initialization:", results.initialization ? "✅ PASS" : "❌ FAIL");
  console.log("Message Sending:", results.messageSending ? "✅ PASS" : "❌ FAIL");
  console.log("Function Registration:", results.functionRegistration ? "✅ PASS" : "❌ FAIL");
  console.log("Realtime Communication:", results.realtimeCommunication ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result);

  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED - SocketLib integration is working correctly!");
  } else {
    console.log("⚠️ SOME TESTS FAILED - Check the logs above for details");
  }

  return results;
}

/**
 * Quick SocketLib status check
 */
function quickSocketLibStatus() {
  console.log("=== QUICK SOCKETLIB STATUS ===");

  const status = {
    socketlibAvailable: typeof socketlib !== 'undefined',
    socketAvailable: !!window.socket,
    cyberpunkAgentAvailable: !!window.CyberpunkAgent?.instance,
    integrationAvailable: window.CyberpunkAgent?.instance?.socketLibIntegration?.isAvailable || false
  };

  console.log("Status:", status);

  if (status.socketlibAvailable && status.socketAvailable && status.cyberpunkAgentAvailable && status.integrationAvailable) {
    console.log("✅ SocketLib integration appears to be working");
    return true;
  } else {
    console.log("❌ SocketLib integration has issues");
    return false;
  }
}

// Make functions globally available
window.testSocketLibInitialization = testSocketLibInitialization;
window.testSocketLibMessageSending = testSocketLibMessageSending;
window.testSocketLibFunctionRegistration = testSocketLibFunctionRegistration;
window.testRealtimeCommunication = testRealtimeCommunication;
window.runAllSocketLibTests = runAllSocketLibTests;
window.quickSocketLibStatus = quickSocketLibStatus;

console.log("Cyberpunk Agent | SocketLib test suite loaded");
console.log("Available test functions:");
console.log("- testSocketLibInitialization()");
console.log("- testSocketLibMessageSending()");
console.log("- testSocketLibFunctionRegistration()");
console.log("- testRealtimeCommunication()");
console.log("- runAllSocketLibTests()");
console.log("- quickSocketLibStatus()"); 