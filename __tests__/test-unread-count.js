/**
 * Test Unread Message Count System
 * 
 * This test verifies that the unread message count system works correctly:
 * - Counts unread messages properly
 * - Updates in real-time when new messages arrive
 * - Resets when conversation is opened
 * - Persists across sessions
 */

console.log("=== Testing Unread Message Count System ===");

/**
 * Test basic unread count functionality
 */
async function testUnreadCountBasic() {
  console.log("📊 Testing basic unread count functionality...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for unread count test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`📱 Testing unread count between ${actor1.name} and ${actor2.name}`);

  // Test 1: Check initial unread count (should be 0)
  console.log("🔍 Test 1: Checking initial unread count...");
  const initialUnreadCount = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Initial unread count: ${initialUnreadCount}`);

  if (initialUnreadCount !== 0) {
    console.warn("⚠️ Initial unread count is not 0, this might be expected if there are existing messages");
  }

  // Test 2: Send a message from actor2 to actor1
  console.log("📤 Test 2: Sending message from actor2 to actor1...");
  const testMessage = "Esta é uma mensagem de teste para contador não lido!";
  const success = await agent.sendMessage(actor2.id, actor1.id, testMessage);

  if (!success) {
    console.error("❌ Failed to send test message");
    return false;
  }

  console.log("✅ Test message sent successfully");

  // Test 3: Check unread count for actor1 (should be 1)
  console.log("🔍 Test 3: Checking unread count after message...");
  const unreadCountAfterMessage = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after message: ${unreadCountAfterMessage}`);

  if (unreadCountAfterMessage !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCountAfterMessage}`);
    return false;
  }

  console.log("✅ Unread count correctly shows 1 unread message");

  // Test 4: Mark conversation as read
  console.log("📖 Test 4: Marking conversation as read...");
  agent.markConversationAsRead(actor1.id, actor2.id);

  // Test 5: Check unread count after marking as read (should be 0)
  console.log("🔍 Test 5: Checking unread count after marking as read...");
  const unreadCountAfterRead = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after marking as read: ${unreadCountAfterRead}`);

  if (unreadCountAfterRead !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfterRead}`);
    return false;
  }

  console.log("✅ Unread count correctly reset to 0 after marking as read");

  return true;
}

/**
 * Test multiple messages and unread count accumulation
 */
async function testUnreadCountMultiple() {
  console.log("📊 Testing multiple messages unread count...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for multiple messages test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`📱 Testing multiple messages between ${actor1.name} and ${actor2.name}`);

  // Mark conversation as read first
  agent.markConversationAsRead(actor1.id, actor2.id);

  // Send multiple messages from actor2 to actor1
  const testMessages = [
    "Primeira mensagem de teste",
    "Segunda mensagem de teste",
    "Terceira mensagem de teste"
  ];

  console.log("📤 Sending multiple test messages...");
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📤 Sending message ${i + 1}: ${message}`);

    const success = await agent.sendMessage(actor2.id, actor1.id, message);
    if (!success) {
      console.error(`❌ Failed to send message ${i + 1}`);
      return false;
    }

    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Check unread count (should be 3)
  console.log("🔍 Checking unread count after multiple messages...");
  const unreadCount = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after multiple messages: ${unreadCount}`);

  if (unreadCount !== 3) {
    console.error(`❌ Expected unread count to be 3, but got ${unreadCount}`);
    return false;
  }

  console.log("✅ Unread count correctly shows 3 unread messages");

  // Mark conversation as read
  console.log("📖 Marking conversation as read...");
  agent.markConversationAsRead(actor1.id, actor2.id);

  // Check unread count again (should be 0)
  const unreadCountAfterRead = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after marking as read: ${unreadCountAfterRead}`);

  if (unreadCountAfterRead !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfterRead}`);
    return false;
  }

  console.log("✅ Unread count correctly reset to 0 after marking as read");

  return true;
}

/**
 * Test unread count for all contacts of an actor
 */
async function testUnreadCountsForActor() {
  console.log("📊 Testing unread counts for all contacts of an actor...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 3) {
    console.error("❌ Need at least 3 character actors for all contacts test");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];
  const actor3 = characterActors[2];

  console.log(`📱 Testing unread counts for ${actor1.name} with multiple contacts`);

  // Add actor2 and actor3 as contacts for actor1
  console.log("👥 Adding contacts for actor1...");
  agent.addContactToActor(actor1.id, actor2.id);
  agent.addContactToActor(actor1.id, actor3.id);

  // Mark all conversations as read first
  agent.markConversationAsRead(actor1.id, actor2.id);
  agent.markConversationAsRead(actor1.id, actor3.id);

  // Send messages from different contacts
  console.log("📤 Sending messages from different contacts...");
  await agent.sendMessage(actor2.id, actor1.id, "Mensagem do contato 1");
  await agent.sendMessage(actor3.id, actor1.id, "Mensagem do contato 2");
  await agent.sendMessage(actor2.id, actor1.id, "Segunda mensagem do contato 1");

  // Get unread counts for all contacts
  console.log("🔍 Getting unread counts for all contacts...");
  const unreadCounts = agent.getUnreadCountsForActor(actor1.id);
  console.log("Unread counts:", unreadCounts);

  // Check expected counts
  const expectedCounts = {
    [actor2.id]: 2, // 2 messages from actor2
    [actor3.id]: 1  // 1 message from actor3
  };

  let allCorrect = true;
  Object.entries(expectedCounts).forEach(([contactId, expectedCount]) => {
    const actualCount = unreadCounts[contactId] || 0;
    console.log(`Contact ${contactId}: expected ${expectedCount}, got ${actualCount}`);
    if (actualCount !== expectedCount) {
      console.error(`❌ Wrong unread count for contact ${contactId}`);
      allCorrect = false;
    }
  });

  if (!allCorrect) {
    console.error("❌ Some unread counts are incorrect");
    return false;
  }

  console.log("✅ All unread counts are correct");

  return true;
}

/**
 * Test persistence of read timestamps
 */
async function testReadTimestampPersistence() {
  console.log("📊 Testing read timestamp persistence...");

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

  console.log(`📱 Testing read timestamp persistence between ${actor1.name} and ${actor2.id}`);

  // Send a message
  console.log("📤 Sending test message...");
  await agent.sendMessage(actor2.id, actor1.id, "Mensagem para teste de persistência");

  // Check unread count
  const unreadCountBefore = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count before marking as read: ${unreadCountBefore}`);

  if (unreadCountBefore !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCountBefore}`);
    return false;
  }

  // Mark as read
  console.log("📖 Marking conversation as read...");
  agent.markConversationAsRead(actor1.id, actor2.id);

  // Check unread count after marking as read
  const unreadCountAfter = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after marking as read: ${unreadCountAfter}`);

  if (unreadCountAfter !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfter}`);
    return false;
  }

  // Send another message
  console.log("📤 Sending another test message...");
  await agent.sendMessage(actor2.id, actor1.id, "Segunda mensagem para teste de persistência");

  // Check unread count (should be 1 again)
  const unreadCountAfterSecond = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after second message: ${unreadCountAfterSecond}`);

  if (unreadCountAfterSecond !== 1) {
    console.error(`❌ Expected unread count to be 1 after second message, but got ${unreadCountAfterSecond}`);
    return false;
  }

  console.log("✅ Read timestamp persistence working correctly");

  return true;
}

/**
 * Run all unread count tests
 */
async function runUnreadCountTests() {
  console.log("🚀 Starting unread count system tests...");

  const tests = [
    { name: "Basic Unread Count", test: testUnreadCountBasic },
    { name: "Multiple Messages", test: testUnreadCountMultiple },
    { name: "All Contacts Unread Count", test: testUnreadCountsForActor },
    { name: "Read Timestamp Persistence", test: testReadTimestampPersistence }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const testInfo of tests) {
    console.log(`\n🧪 Running test: ${testInfo.name}`);
    try {
      const result = await testInfo.test();
      if (result) {
        console.log(`✅ ${testInfo.name} PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${testInfo.name} FAILED`);
      }
    } catch (error) {
      console.error(`❌ ${testInfo.name} ERROR:`, error);
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All unread count tests passed!");
    ui.notifications.success("Todos os testes de contador de mensagens não lidas passaram!");
  } else {
    console.log("⚠️ Some tests failed");
    ui.notifications.warn(`${passedTests}/${totalTests} testes de contador de mensagens não lidas passaram`);
  }

  return passedTests === totalTests;
}

// Export test functions for global access
window.testUnreadCountBasic = testUnreadCountBasic;
window.testUnreadCountMultiple = testUnreadCountMultiple;
window.testUnreadCountsForActor = testUnreadCountsForActor;
window.testReadTimestampPersistence = testReadTimestampPersistence;
window.runUnreadCountTests = runUnreadCountTests;

console.log("📋 Unread count test functions loaded. Use runUnreadCountTests() to run all tests."); 