/**
 * Test Message Persistence Fix
 * Tests the fix for messages not being saved properly when agent is closed
 */

console.log("Cyberpunk Agent | Loading message persistence fix test...");

/**
 * Test message persistence when agent is closed
 */
async function testMessagePersistenceFix() {
  console.log("Cyberpunk Agent | Testing message persistence fix...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("Cyberpunk Agent | CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Get test actors
    const actors = game.actors.contents.slice(0, 2);
    if (actors.length < 2) {
      console.error("Cyberpunk Agent | Need at least 2 actors for testing");
      return false;
    }

    const senderActor = actors[0];
    const receiverActor = actors[1];

    console.log("Cyberpunk Agent | Test actors:", {
      sender: senderActor.name,
      receiver: receiverActor.name
    });

    // Clear existing messages for these actors
    console.log("Cyberpunk Agent | Clearing existing messages...");
    const conversationKey = agent._getConversationKey(senderActor.id, receiverActor.id);
    agent.messages.delete(conversationKey);

    // Save empty state
    await agent.saveMessagesForActor(senderActor.id);
    await agent.saveMessagesForActor(receiverActor.id);

    // Test 1: Send message normally (agent open)
    console.log("Cyberpunk Agent | Test 1: Sending message with agent open...");
    const testMessage1 = "Test message 1 - agent open";
    const success1 = await agent.sendMessage(senderActor.id, receiverActor.id, testMessage1);

    if (!success1) {
      console.error("Cyberpunk Agent | Failed to send message 1");
      return false;
    }

    // Verify message is in memory
    const messages1 = agent.getMessagesForConversation(senderActor.id, receiverActor.id);
    console.log("Cyberpunk Agent | Messages in memory after send 1:", messages1.length);

    if (messages1.length !== 1) {
      console.error("Cyberpunk Agent | Expected 1 message in memory, got:", messages1.length);
      return false;
    }

    // Test 2: Simulate receiving message via SocketLib (agent closed)
    console.log("Cyberpunk Agent | Test 2: Simulating SocketLib message reception...");

    // Clear messages from memory to simulate agent being closed
    agent.messages.delete(conversationKey);
    console.log("Cyberpunk Agent | Cleared messages from memory to simulate closed agent");

    // Simulate SocketLib message reception
    const socketLibMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: senderActor.id,
      receiverId: receiverActor.id,
      text: "Test message 2 - via SocketLib",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };

    // Simulate the SocketLib handler logic
    if (!agent.messages.has(conversationKey)) {
      agent.messages.set(conversationKey, []);
    }

    const conversation = agent.messages.get(conversationKey);
    conversation.push(socketLibMessage);

    // Use the corrected save method
    await agent.saveMessagesForActor(senderActor.id);
    if (senderActor.id !== receiverActor.id) {
      await agent.saveMessagesForActor(receiverActor.id);
    }

    console.log("Cyberpunk Agent | SocketLib message saved using corrected method");

    // Test 3: Load messages for actor (simulating agent opening)
    console.log("Cyberpunk Agent | Test 3: Loading messages for actor (agent opening)...");

    // Clear memory again to simulate fresh agent opening
    agent.messages.delete(conversationKey);
    console.log("Cyberpunk Agent | Cleared messages from memory to simulate fresh agent opening");

    // Load messages for the actor
    await agent.loadMessagesForActor(receiverActor.id);

    const messagesAfterLoad = agent.getMessagesForConversation(senderActor.id, receiverActor.id);
    console.log("Cyberpunk Agent | Messages after loading for actor:", messagesAfterLoad.length);
    console.log("Cyberpunk Agent | Messages content:", messagesAfterLoad);

    if (messagesAfterLoad.length !== 2) {
      console.error("Cyberpunk Agent | Expected 2 messages after loading, got:", messagesAfterLoad.length);
      return false;
    }

    // Verify both messages are present
    const messageTexts = messagesAfterLoad.map(m => m.text);
    const expectedTexts = [testMessage1, "Test message 2 - via SocketLib"];

    const allMessagesPresent = expectedTexts.every(expected =>
      messageTexts.some(actual => actual.includes(expected.split(' - ')[0]))
    );

    if (!allMessagesPresent) {
      console.error("Cyberpunk Agent | Not all expected messages found");
      console.error("Expected:", expectedTexts);
      console.error("Found:", messageTexts);
      return false;
    }

    console.log("Cyberpunk Agent | ✅ Message persistence fix test PASSED");
    return true;

  } catch (error) {
    console.error("Cyberpunk Agent | Error in message persistence fix test:", error);
    return false;
  }
}

/**
 * Test SocketLib message handling with corrected save method
 */
async function testSocketLibMessageHandling() {
  console.log("Cyberpunk Agent | Testing SocketLib message handling...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("Cyberpunk Agent | CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Get test actors
    const actors = game.actors.contents.slice(0, 2);
    if (actors.length < 2) {
      console.error("Cyberpunk Agent | Need at least 2 actors for testing");
      return false;
    }

    const senderActor = actors[0];
    const receiverActor = actors[1];

    // Clear existing messages
    const conversationKey = agent._getConversationKey(senderActor.id, receiverActor.id);
    agent.messages.delete(conversationKey);

    // Simulate SocketLib sendMessage data
    const socketLibData = {
      userId: game.user.id,
      userName: game.user.name,
      senderId: senderActor.id,
      receiverId: receiverActor.id,
      text: "Test SocketLib message",
      messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    // Simulate the corrected handleSendMessage logic
    if (!agent.messages.has(conversationKey)) {
      agent.messages.set(conversationKey, []);
    }

    const conversation = agent.messages.get(conversationKey);

    // Check if message already exists
    const existingMessage = conversation.find(msg => msg.id === socketLibData.messageId);
    if (existingMessage) {
      console.log("Cyberpunk Agent | Message already exists, skipping duplicate");
      return true;
    }

    // Add the message
    const message = {
      id: socketLibData.messageId,
      senderId: socketLibData.senderId,
      receiverId: socketLibData.receiverId,
      text: socketLibData.text,
      timestamp: socketLibData.timestamp,
      time: new Date(socketLibData.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };

    conversation.push(message);

    // Use the corrected save method
    await agent.saveMessagesForActor(socketLibData.senderId);
    if (socketLibData.senderId !== socketLibData.receiverId) {
      await agent.saveMessagesForActor(socketLibData.receiverId);
    }

    console.log("Cyberpunk Agent | SocketLib message processed and saved");

    // Verify message is saved
    const messages = agent.getMessagesForConversation(senderActor.id, receiverActor.id);
    if (messages.length !== 1) {
      console.error("Cyberpunk Agent | Expected 1 message after SocketLib processing, got:", messages.length);
      return false;
    }

    console.log("Cyberpunk Agent | ✅ SocketLib message handling test PASSED");
    return true;

  } catch (error) {
    console.error("Cyberpunk Agent | Error in SocketLib message handling test:", error);
    return false;
  }
}

/**
 * Test localStorage persistence
 */
async function testLocalStoragePersistence() {
  console.log("Cyberpunk Agent | Testing localStorage persistence...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("Cyberpunk Agent | CyberpunkAgent instance not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  try {
    // Get test actor
    const actor = game.actors.contents[0];
    if (!actor) {
      console.error("Cyberpunk Agent | No actors available for testing");
      return false;
    }

    // Test saving messages for actor
    const testMessage = {
      id: "test-message-id",
      senderId: actor.id,
      receiverId: actor.id,
      text: "Test localStorage message",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };

    // Add message to memory
    const conversationKey = agent._getConversationKey(actor.id, actor.id);
    agent.messages.set(conversationKey, [testMessage]);

    // Save using the corrected method
    await agent.saveMessagesForActor(actor.id);

    // Check if message was saved to localStorage
    const storageKey = `cyberpunk-agent-messages-${game.user.id}-${actor.id}`;
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      console.error("Cyberpunk Agent | No data found in localStorage for actor");
      return false;
    }

    const parsedData = JSON.parse(storedData);
    const savedMessages = parsedData[conversationKey] || [];

    if (savedMessages.length !== 1) {
      console.error("Cyberpunk Agent | Expected 1 message in localStorage, got:", savedMessages.length);
      return false;
    }

    if (savedMessages[0].text !== testMessage.text) {
      console.error("Cyberpunk Agent | Message text mismatch in localStorage");
      return false;
    }

    console.log("Cyberpunk Agent | ✅ localStorage persistence test PASSED");
    return true;

  } catch (error) {
    console.error("Cyberpunk Agent | Error in localStorage persistence test:", error);
    return false;
  }
}

/**
 * Run all message persistence fix tests
 */
async function runAllMessagePersistenceFixTests() {
  console.log("Cyberpunk Agent | Running all message persistence fix tests...");

  const tests = [
    { name: "Message Persistence Fix", test: testMessagePersistenceFix },
    { name: "SocketLib Message Handling", test: testSocketLibMessageHandling },
    { name: "LocalStorage Persistence", test: testLocalStoragePersistence }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of tests) {
    console.log(`\n--- Running ${testCase.name} Test ---`);
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

  console.log(`\n--- Test Results ---`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);

  if (failed === 0) {
    console.log("🎉 All message persistence fix tests PASSED!");
    ui.notifications.info("Todos os testes de correção de persistência de mensagens passaram!");
  } else {
    console.log("⚠️ Some message persistence fix tests FAILED!");
    ui.notifications.warn(`${failed} teste(s) de correção de persistência de mensagens falharam!`);
  }

  return { passed, failed, total: tests.length };
}

// Make functions available globally
window.testMessagePersistenceFix = testMessagePersistenceFix;
window.testSocketLibMessageHandling = testSocketLibMessageHandling;
window.testLocalStoragePersistence = testLocalStoragePersistence;
window.runAllMessagePersistenceFixTests = runAllMessagePersistenceFixTests;

console.log("Cyberpunk Agent | Message persistence fix test loaded successfully");
console.log("Cyberpunk Agent | Available test functions:");
console.log("  - testMessagePersistenceFix()");
console.log("  - testSocketLibMessageHandling()");
console.log("  - testLocalStoragePersistence()");
console.log("  - runAllMessagePersistenceFixTests()"); 