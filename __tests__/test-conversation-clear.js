/**
 * Test script for conversation clear functionality
 * Run this in the browser console to test the new conversation clear feature
 */

console.log("=== Cyberpunk Agent | Conversation Clear Test ===");

window.testConversationClear = async () => {
  console.log("🧪 Testing conversation clear functionality...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  console.log("✅ CyberpunkAgent instance found");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 actors to test conversation clear");
    console.log("Available actors:", userActors.map(a => a.name));
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];
  console.log(`📱 Testing with actors: ${actor1.name} and ${actor2.name}`);

  // Add actor2 as a contact to actor1
  console.log("📞 Adding contact...");
  agent.addContactToActor(actor1.id, actor2.id);

  // Send some test messages
  console.log("💬 Sending test messages...");
  await agent.sendMessage(actor1.id, actor2.id, "Test message 1 from actor1");
  await agent.sendMessage(actor2.id, actor1.id, "Test message 1 from actor2");
  await agent.sendMessage(actor1.id, actor2.id, "Test message 2 from actor1");
  await agent.sendMessage(actor2.id, actor1.id, "Test message 2 from actor2");

  // Check messages before clear
  const messagesBefore = agent.getMessagesForConversation(actor1.id, actor2.id);
  console.log(`📊 Messages before clear: ${messagesBefore.length}`);
  console.log("Messages:", messagesBefore);

  // Test conversation clear
  console.log("🗑️ Testing conversation clear...");
  const success = await agent.clearConversationHistory(actor1.id, actor2.id);

  if (success) {
    console.log("✅ Conversation clear successful");

    // Check messages after clear
    const messagesAfter = agent.getMessagesForConversation(actor1.id, actor2.id);
    console.log(`📊 Messages after clear: ${messagesAfter.length}`);
    console.log("Messages:", messagesAfter);

    // Check unread count
    const unreadCount = agent.getUnreadCount(actor1.id, actor2.id);
    console.log(`📊 Unread count after clear: ${unreadCount}`);

    if (messagesAfter.length === 0 && unreadCount === 0) {
      console.log("✅ Conversation clear test passed!");
      return true;
    } else {
      console.error("❌ Conversation clear test failed - messages or unread count not cleared");
      return false;
    }
  } else {
    console.error("❌ Conversation clear failed");
    return false;
  }
};

window.testConversationClearContextMenu = async () => {
  console.log("🧪 Testing conversation clear context menu...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  console.log("✅ CyberpunkAgent instance found");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 actors to test context menu");
    return false;
  }

  const actor1 = userActors[0];
  console.log(`📱 Testing context menu for actor: ${actor1.name}`);

  // Open Agent interface
  console.log("📱 Opening Agent interface...");
  await agent.showAgentHome(actor1);

  // Wait a moment for the interface to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if context menu option exists
  const contextMenuItems = document.querySelectorAll('.cp-context-menu-item');
  const clearHistoryItem = Array.from(contextMenuItems).find(item =>
    item.textContent.includes('Limpar Histórico')
  );

  if (clearHistoryItem) {
    console.log("✅ Clear history context menu option found");
    return true;
  } else {
    console.error("❌ Clear history context menu option not found");
    console.log("Available context menu items:", Array.from(contextMenuItems).map(item => item.textContent));
    return false;
  }
};

window.testConversationClearSocketLib = async () => {
  console.log("🧪 Testing conversation clear SocketLib integration...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  console.log("✅ CyberpunkAgent instance found");

  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib available");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 actors to test SocketLib integration");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];
  console.log(`📱 Testing SocketLib integration with actors: ${actor1.name} and ${actor2.name}`);

  // Add actor2 as a contact to actor1
  agent.addContactToActor(actor1.id, actor2.id);

  // Send some test messages
  await agent.sendMessage(actor1.id, actor2.id, "SocketLib test message 1");
  await agent.sendMessage(actor2.id, actor1.id, "SocketLib test message 2");

  // Test conversation clear with SocketLib notification
  console.log("🗑️ Testing conversation clear with SocketLib notification...");
  const success = await agent.clearConversationHistory(actor1.id, actor2.id);

  if (success) {
    console.log("✅ Conversation clear with SocketLib successful");
    console.log("💡 Check other clients to see if they received the clear notification");
    return true;
  } else {
    console.error("❌ Conversation clear with SocketLib failed");
    return false;
  }
};

window.testConversationClearIsolation = async () => {
  console.log("🧪 Testing conversation clear isolation...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  console.log("✅ CyberpunkAgent instance found");

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 actors to test isolation");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];
  console.log(`📱 Testing isolation with actors: ${actor1.name} and ${actor2.name}`);

  // Add contacts
  agent.addContactToActor(actor1.id, actor2.id);
  agent.addContactToActor(actor2.id, actor1.id);

  // Send messages from both sides
  await agent.sendMessage(actor1.id, actor2.id, "Message from actor1 to actor2");
  await agent.sendMessage(actor2.id, actor1.id, "Message from actor2 to actor1");

  // Check initial state
  const messages1to2 = agent.getMessagesForConversation(actor1.id, actor2.id);
  const messages2to1 = agent.getMessagesForConversation(actor2.id, actor1.id);
  console.log(`📊 Initial messages: ${messages1to2.length} (1→2), ${messages2to1.length} (2→1)`);

  // Clear conversation for actor1 only
  console.log("🗑️ Clearing conversation for actor1 only...");
  await agent.clearConversationHistory(actor1.id, actor2.id);

  // Check state after clear
  const messages1to2After = agent.getMessagesForConversation(actor1.id, actor2.id);
  const messages2to1After = agent.getMessagesForConversation(actor2.id, actor1.id);
  console.log(`📊 After clear: ${messages1to2After.length} (1→2), ${messages2to1After.length} (2→1)`);

  // Verify isolation
  if (messages1to2After.length === 0 && messages2to1After.length > 0) {
    console.log("✅ Conversation clear isolation test passed!");
    console.log("✅ Actor1's view is cleared, Actor2's view remains intact");
    return true;
  } else {
    console.error("❌ Conversation clear isolation test failed");
    console.error("Expected: Actor1 cleared (0), Actor2 intact (>0)");
    console.error(`Actual: Actor1 (${messages1to2After.length}), Actor2 (${messages2to1After.length})`);
    return false;
  }
};

window.runAllConversationClearTests = async () => {
  console.log("🚀 Running all conversation clear tests...");

  const tests = [
    { name: "Basic Conversation Clear", fn: testConversationClear },
    { name: "Context Menu", fn: testConversationClearContextMenu },
    { name: "SocketLib Integration", fn: testConversationClearSocketLib },
    { name: "Clear Isolation", fn: testConversationClearIsolation }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(result ? "✅ PASSED" : "❌ FAILED");
    } catch (error) {
      console.error(`❌ ERROR in ${test.name}:`, error);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    const error = result.error ? ` (${result.error})` : "";
    console.log(`${status} ${result.name}${error}`);
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All conversation clear tests passed!");
  } else {
    console.log("⚠️ Some tests failed. Check the logs above for details.");
  }

  return results;
};

console.log("Conversation Clear Test Functions Available:");
console.log("  - testConversationClear() - Test basic conversation clear functionality");
console.log("  - testConversationClearContextMenu() - Test context menu integration");
console.log("  - testConversationClearSocketLib() - Test SocketLib integration");
console.log("  - testConversationClearIsolation() - Test clear isolation between actors");
console.log("  - runAllConversationClearTests() - Run all tests");
console.log("\n💡 Run 'runAllConversationClearTests()' to test everything!"); 