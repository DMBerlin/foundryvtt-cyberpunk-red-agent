/**
 * Test Unread Message Count System
 * 
 * Simple test script to verify the unread message count functionality
 */

console.log("=== Testing Unread Message Count System ===");

/**
 * Test basic unread count functionality
 */
async function testUnreadCount() {
  console.log("📊 Testing unread count functionality...");

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

  // Test 1: Check initial unread count
  console.log("🔍 Test 1: Checking initial unread count...");
  const initialUnreadCount = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Initial unread count: ${initialUnreadCount}`);

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

  // Test 6: Send another message and check count
  console.log("📤 Test 6: Sending another message...");
  await agent.sendMessage(actor2.id, actor1.id, "Segunda mensagem de teste!");

  const unreadCountAfterSecond = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`Unread count after second message: ${unreadCountAfterSecond}`);

  if (unreadCountAfterSecond !== 1) {
    console.error(`❌ Expected unread count to be 1 after second message, but got ${unreadCountAfterSecond}`);
    return false;
  }

  console.log("✅ Unread count correctly shows 1 unread message after second message");

  return true;
}

/**
 * Test unread counts for all contacts
 */
async function testUnreadCountsForActor() {
  console.log("📊 Testing unread counts for all contacts...");

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
 * Run all unread count tests
 */
async function runUnreadCountTests() {
  console.log("🚀 Starting unread count system tests...");

  const tests = [
    { name: "Basic Unread Count", test: testUnreadCount },
    { name: "All Contacts Unread Count", test: testUnreadCountsForActor }
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
window.testUnreadCount = testUnreadCount;
window.testUnreadCountsForActor = testUnreadCountsForActor;
window.runUnreadCountTests = runUnreadCountTests;

console.log("📋 Unread count test functions loaded. Use runUnreadCountTests() to run all tests."); 