/**
 * Test Chat Messages with SocketLib
 * Tests the messaging functionality using SocketLib for real-time communication
 */

console.log("Cyberpunk Agent | Loading chat messages test...");

/**
 * Test basic message sending and receiving
 */
async function testBasicMessageFlow() {
  console.log("=== Basic Message Flow Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for message test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`📱 Testing message flow between ${actor1.name} and ${actor2.name}`);

  // Test 1: Send message
  console.log("📤 Sending test message...");
  const testMessage = "Esta é uma mensagem de teste via SocketLib!";
  const success = await agent.sendMessage(actor1.id, actor2.id, testMessage);

  if (!success) {
    console.error("❌ Failed to send message");
    return false;
  }

  console.log("✅ Message sent successfully");

  // Test 2: Check if message was saved locally
  console.log("📋 Checking local message storage...");
  const messages = agent.getMessagesForConversation(actor1.id, actor2.id);
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage || lastMessage.text !== testMessage) {
    console.error("❌ Message not found in local storage");
    console.log("Messages:", messages);
    return false;
  }

  console.log("✅ Message found in local storage");

  // Test 3: Check SocketLib integration
  console.log("🔌 Checking SocketLib integration...");
  if (agent._isSocketLibAvailable()) {
    console.log("✅ SocketLib available");

    // Test SocketLib message sending
    const socketLibTest = await agent.socketLibIntegration.testMessageSending();
    if (socketLibTest) {
      console.log("✅ SocketLib message test successful");
    } else {
      console.warn("⚠️ SocketLib message test failed");
    }
  } else {
    console.warn("⚠️ SocketLib not available");
  }

  console.log("✅ Basic message flow test completed");
  return true;
}

/**
 * Test real-time message updates
 */
async function testRealtimeMessageUpdates() {
  console.log("=== Real-time Message Updates Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for realtime test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`🔄 Testing real-time updates between ${actor1.name} and ${actor2.name}`);

  // Test 1: Check communication method
  const communicationMethod = agent._getCommunicationMethod();
  console.log(`📡 Communication method: ${communicationMethod}`);

  if (communicationMethod === 'none') {
    console.warn("⚠️ No communication method available for real-time testing");
    return false;
  }

  // Test 2: Send multiple messages to test real-time updates
  const testMessages = [
    "Mensagem de teste #1",
    "Mensagem de teste #2",
    "Mensagem de teste #3"
  ];

  console.log("📤 Sending multiple test messages...");

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📤 Sending message ${i + 1}: ${message}`);

    const success = await agent.sendMessage(actor1.id, actor2.id, message);
    if (!success) {
      console.error(`❌ Failed to send message ${i + 1}`);
      return false;
    }

    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("✅ All test messages sent");

  // Test 3: Check if all messages are in storage
  const messages = agent.getMessagesForConversation(actor1.id, actor2.id);
  console.log(`📋 Total messages in conversation: ${messages.length}`);

  // Check if our test messages are there
  const recentMessages = messages.slice(-testMessages.length);
  const allTestMessagesFound = testMessages.every((testMsg, index) =>
    recentMessages[index] && recentMessages[index].text === testMsg
  );

  if (!allTestMessagesFound) {
    console.error("❌ Not all test messages found in storage");
    console.log("Expected:", testMessages);
    console.log("Found:", recentMessages.map(m => m.text));
    return false;
  }

  console.log("✅ All test messages found in storage");

  console.log("✅ Real-time message updates test completed");
  return true;
}

/**
 * Test message interface updates
 */
async function testMessageInterfaceUpdates() {
  console.log("=== Message Interface Updates Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check if there are open interfaces
  const openInterfacesCount = agent.getOpenInterfacesCount();
  console.log(`🖥️ Open interfaces: ${openInterfacesCount}`);

  if (openInterfacesCount === 0) {
    console.warn("⚠️ No open interfaces to test updates");
    console.log("💡 Open a chat interface to test real-time updates");
    return false;
  }

  // Test 2: Force update interfaces
  console.log("🔄 Forcing interface updates...");
  agent.forceUpdateChatInterfaces();
  agent.updateOpenInterfaces();

  console.log("✅ Interface updates test completed");
  return true;
}

/**
 * Test SocketLib message handlers
 */
async function testSocketLibMessageHandlers() {
  console.log("=== SocketLib Message Handlers Test ===");

  if (!window.SocketLibIntegration) {
    console.error("❌ SocketLib integration not available");
    return false;
  }

  const integration = new window.SocketLibIntegration();

  if (!integration.isAvailable) {
    console.error("❌ SocketLib integration not available");
    return false;
  }

  console.log("✅ SocketLib integration available");

  // Test 1: Test message sending via SocketLib
  console.log("📤 Testing SocketLib message sending...");
  const messageTest = await integration.testMessageSending();

  if (messageTest) {
    console.log("✅ SocketLib message sending test successful");
  } else {
    console.warn("⚠️ SocketLib message sending test failed");
  }

  // Test 2: Test connection
  console.log("🔌 Testing SocketLib connection...");
  const connectionTest = await integration.testConnection();

  if (connectionTest) {
    console.log("✅ SocketLib connection test successful");
  } else {
    console.warn("⚠️ SocketLib connection test failed");
  }

  // Test 3: Get status
  console.log("📊 Getting SocketLib status...");
  const status = integration.getDetailedStatus();
  console.log("Status:", status);

  console.log("✅ SocketLib message handlers test completed");
  return true;
}

/**
 * Test message persistence
 */
async function testMessagePersistence() {
  console.log("=== Message Persistence Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for persistence test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`💾 Testing message persistence between ${actor1.name} and ${actor2.name}`);

  // Test 1: Send a message
  const testMessage = "Mensagem de teste para persistência";
  console.log("📤 Sending test message...");
  const success = await agent.sendMessage(actor1.id, actor2.id, testMessage);

  if (!success) {
    console.error("❌ Failed to send message");
    return false;
  }

  // Test 2: Check if message is saved to settings
  console.log("💾 Checking message persistence...");
  const savedMessages = game.settings.get('cyberpunk-agent', 'messages') || {};
  const conversationKey = agent._getConversationKey(actor1.id, actor2.id);
  const savedConversation = savedMessages[conversationKey] || [];

  const messageFound = savedConversation.some(msg => msg.text === testMessage);

  if (!messageFound) {
    console.error("❌ Message not found in saved settings");
    console.log("Saved messages:", savedMessages);
    return false;
  }

  console.log("✅ Message found in saved settings");

  // Test 3: Reload data and check if message is still there
  console.log("🔄 Reloading agent data...");
  agent.loadAgentData();

  const reloadedMessages = agent.getMessagesForConversation(actor1.id, actor2.id);
  const reloadedMessageFound = reloadedMessages.some(msg => msg.text === testMessage);

  if (!reloadedMessageFound) {
    console.error("❌ Message not found after data reload");
    return false;
  }

  console.log("✅ Message found after data reload");

  console.log("✅ Message persistence test completed");
  return true;
}

/**
 * Run all message tests
 */
async function runAllMessageTests() {
  console.log("🚀 Running all message tests...");

  const tests = [
    { name: "Basic Message Flow", test: testBasicMessageFlow },
    { name: "Real-time Updates", test: testRealtimeMessageUpdates },
    { name: "Interface Updates", test: testMessageInterfaceUpdates },
    { name: "SocketLib Handlers", test: testSocketLibMessageHandlers },
    { name: "Message Persistence", test: testMessagePersistence }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of tests) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    try {
      const result = await testCase.test();
      if (result) {
        console.log(`✅ ${testCase.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${testCase.name}: ERROR -`, error);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All message tests passed!");
  } else {
    console.log("⚠️ Some message tests failed");
  }

  return { passed, failed };
}

// Make test functions globally available
window.testBasicMessageFlow = testBasicMessageFlow;
window.testRealtimeMessageUpdates = testRealtimeMessageUpdates;
window.testMessageInterfaceUpdates = testMessageInterfaceUpdates;
window.testSocketLibMessageHandlers = testSocketLibMessageHandlers;
window.testMessagePersistence = testMessagePersistence;
window.runAllMessageTests = runAllMessageTests;

console.log("Cyberpunk Agent | Chat messages test loaded");
console.log("Available test functions:");
console.log("  - testBasicMessageFlow() - Test basic message sending");
console.log("  - testRealtimeMessageUpdates() - Test real-time updates");
console.log("  - testMessageInterfaceUpdates() - Test interface updates");
console.log("  - testSocketLibMessageHandlers() - Test SocketLib handlers");
console.log("  - testMessagePersistence() - Test message persistence");
console.log("  - runAllMessageTests() - Run all message tests"); 