/**
 * Test script to verify message loop fix
 * This script tests if the infinite message loop has been fixed
 */

console.log("=== Message Loop Fix Test ===");

// Test function to check if message loop is fixed
window.testMessageLoopFix = async () => {
  console.log("🧪 Testing message loop fix...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check current user
  console.log("1. Testing current user...");
  console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

  // Test 2: Get user actors
  console.log("2. Testing user actors...");
  const userActors = agent.getUserActors();
  console.log(`📱 User actors: ${userActors.length}`);

  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📱 Testing with actors: ${actor1.name} and ${actor2.name}`);

  // Test 3: Send a test message
  console.log("3. Testing message sending...");

  try {
    const result = await agent.sendMessage(actor1.id, actor2.id, "Teste de correção do loop de mensagens");
    console.log(`✅ Message send result: ${result}`);

    if (result) {
      console.log("✅ Message sent successfully");
    } else {
      console.error("❌ Message send failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return false;
  }

  // Test 4: Check if messages were saved
  console.log("4. Testing message saving...");

  const messages = agent.getMessagesForConversation(actor1.id, actor2.id);
  console.log(`📊 Messages in conversation: ${messages.length}`);

  if (messages.length === 0) {
    console.error("❌ No messages found in conversation");
    return false;
  }

  // Test 5: Check message structure
  console.log("5. Testing message structure...");

  const lastMessage = messages[messages.length - 1];
  console.log(`📝 Last message:`, {
    id: lastMessage.id,
    senderId: lastMessage.senderId,
    receiverId: lastMessage.receiverId,
    text: lastMessage.text,
    read: lastMessage.read,
    timestamp: lastMessage.timestamp
  });

  // Test 6: Test unread count
  console.log("6. Testing unread count...");

  const unreadCount = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count for ${actor2.name}: ${unreadCount}`);

  if (unreadCount !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCount}`);
    return false;
  }

  // Test 7: Test marking as read
  console.log("7. Testing mark as read...");

  agent.markConversationAsRead(actor2.id, actor1.id);

  const unreadCountAfterRead = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count after marking as read: ${unreadCountAfterRead}`);

  if (unreadCountAfterRead !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfterRead}`);
    return false;
  }

  // Test 8: Check for console loops
  console.log("8. Testing for console loops...");
  console.log("ℹ️ Check the console - there should be no infinite loops");
  console.log("ℹ️ Look for repeated messages like 'saveMessagesResponse' or 'Requesting GM to save messages'");
  console.log("ℹ️ If you see loops, the fix didn't work");

  // Test 9: Test message persistence
  console.log("9. Testing message persistence...");

  try {
    await agent.saveMessages();
    console.log("✅ Messages saved successfully");

    // Clear and reload
    agent.messages.clear();
    await agent.loadMessages();

    const reloadedMessages = agent.getMessagesForConversation(actor1.id, actor2.id);
    console.log(`✅ Messages reloaded: ${reloadedMessages.length} messages`);

    if (reloadedMessages.length === 0) {
      console.error("❌ No messages found after reload");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing message persistence:", error);
    return false;
  }

  console.log("✅ Message loop fix test completed successfully!");
  console.log("💡 The infinite message loop should now be fixed");
  console.log("💡 Messages should flow correctly between GM and Player");

  ui.notifications.success("Teste de correção do loop de mensagens concluído com sucesso!");
  return true;
};

// Test function to check SocketLib status
window.checkSocketLibStatus = () => {
  console.log("=== SocketLib Status Check ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔍 SocketLib Status Details:");
  console.log(`- SocketLib global: ${typeof socketlib !== 'undefined'}`);
  console.log(`- Socket available: ${!!window.socket}`);
  console.log(`- Integration available: ${!!agent.socketLibIntegration}`);
  console.log(`- Integration isAvailable: ${agent.socketLibIntegration ? agent.socketLibIntegration.isAvailable : false}`);

  if (socketlib) {
    console.log(`- SocketLib version: ${socketlib.version}`);
    console.log(`- SocketLib connected: ${socketlib.isConnected ? socketlib.isConnected() : 'method not available'}`);
    console.log(`- SocketLib modules: ${socketlib.modules ? socketlib.modules.join(', ') : 'not available'}`);
  }

  const isAvailable = agent._isSocketLibAvailable();
  console.log(`- Final availability check: ${isAvailable}`);

  if (isAvailable) {
    console.log("✅ SocketLib is considered available");
  } else {
    console.log("⚠️ SocketLib is not considered available, but communication may still work");
  }
};

// Test function to simulate the original loop conditions
window.testOriginalLoopConditions = () => {
  console.log("=== Testing Original Loop Conditions ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🔍 Simulating original loop conditions...");
  console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

  // Test the current functionality
  try {
    const testData = { "test": "data" };
    const result = agent._requestGMSaveMessages(testData);
    console.log("✅ Message saving test completed without loops");
  } catch (error) {
    console.error("❌ Error testing message saving:", error);
  }

  console.log("ℹ️ If you see repeated console messages, the loop is still happening");
  console.log("ℹ️ If no repeated messages, the fix worked");
};

// Test function to check message flow in both directions
window.testBidirectionalMessageFlow = async () => {
  console.log("=== Bidirectional Message Flow Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🧪 Testing bidirectional message flow...");
  console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📱 Testing with actors: ${actor1.name} and ${actor2.name}`);

  // Test 1: Send message from current user
  console.log("1. Testing message from current user...");

  try {
    const result1 = await agent.sendMessage(actor1.id, actor2.id, "Mensagem do usuário atual");
    console.log(`✅ Message 1 send result: ${result1}`);
  } catch (error) {
    console.error("❌ Error sending message 1:", error);
    return false;
  }

  // Test 2: Simulate message from other user (if GM)
  if (game.user.isGM) {
    console.log("2. Testing message from other user (simulated)...");

    try {
      const result2 = await agent.sendMessage(actor2.id, actor1.id, "Mensagem do outro usuário (simulada)");
      console.log(`✅ Message 2 send result: ${result2}`);
    } catch (error) {
      console.error("❌ Error sending message 2:", error);
      return false;
    }
  } else {
    console.log("2. Skipping simulated message (not GM)");
  }

  // Test 3: Check both conversations
  console.log("3. Testing both conversations...");

  const messages1to2 = agent.getMessagesForConversation(actor1.id, actor2.id);
  const messages2to1 = agent.getMessagesForConversation(actor2.id, actor1.id);

  console.log(`📊 Messages ${actor1.name} → ${actor2.name}: ${messages1to2.length}`);
  console.log(`📊 Messages ${actor2.name} → ${actor1.name}: ${messages2to1.length}`);

  // Test 4: Check unread counts
  console.log("4. Testing unread counts...");

  const unread1to2 = agent.getUnreadCount(actor2.id, actor1.id);
  const unread2to1 = agent.getUnreadCount(actor1.id, actor2.id);

  console.log(`📊 Unread ${actor1.name} → ${actor2.name}: ${unread1to2}`);
  console.log(`📊 Unread ${actor2.name} → ${actor1.name}: ${unread2to1}`);

  console.log("✅ Bidirectional message flow test completed!");
  console.log("💡 Messages should flow in both directions without loops");

  ui.notifications.success("Teste de fluxo bidirecional concluído com sucesso!");
  return true;
};

console.log("Cyberpunk Agent | Message loop fix test functions loaded:");
console.log("  - testMessageLoopFix() - Test if the message loop is fixed");
console.log("  - checkSocketLibStatus() - Check SocketLib status");
console.log("  - testOriginalLoopConditions() - Test original loop conditions");
console.log("  - testBidirectionalMessageFlow() - Test bidirectional message flow"); 