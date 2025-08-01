/**
 * Test script to debug message content display issue
 * This test checks the actual message data structure and template rendering
 */

console.log("=== Cyberpunk Agent | Message Content Debug Test ===");

// Test 1: Check message data structure
function testMessageDataStructure() {
  console.log("\n--- Test 1: Message Data Structure ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const instance = window.CyberpunkAgent.instance;

  // Get all messages to check their structure
  const allMessages = [];
  for (const [conversationKey, messages] of instance.messages) {
    allMessages.push(...messages);
  }

  if (allMessages.length === 0) {
    console.log("ℹ️ No messages found to analyze");
    return false;
  }

  console.log(`📊 Found ${allMessages.length} total messages`);

  // Analyze the first few messages
  const sampleMessages = allMessages.slice(0, 3);
  sampleMessages.forEach((message, index) => {
    console.log(`\n📝 Message ${index + 1}:`, {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      hasText: 'text' in message,
      hasMessage: 'message' in message,
      textValue: message.text,
      messageValue: message.message,
      timestamp: message.timestamp,
      time: message.time,
      read: message.read
    });
  });

  return true;
}

// Test 2: Check getMessagesForConversation output
function testGetMessagesForConversation() {
  console.log("\n--- Test 2: getMessagesForConversation Output ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const instance = window.CyberpunkAgent.instance;

  // Get all conversations
  const conversations = [];
  for (const [conversationKey, messages] of instance.messages) {
    const [actorId1, actorId2] = conversationKey.split('|');
    conversations.push({ actorId1, actorId2, messages });
  }

  if (conversations.length === 0) {
    console.log("ℹ️ No conversations found");
    return false;
  }

  // Test the first conversation
  const firstConversation = conversations[0];
  console.log(`📞 Testing conversation: ${firstConversation.actorId1} <-> ${firstConversation.actorId2}`);

  const processedMessages = instance.getMessagesForConversation(
    firstConversation.actorId1,
    firstConversation.actorId2
  );

  console.log(`📊 Processed ${processedMessages.length} messages:`);
  processedMessages.forEach((message, index) => {
    console.log(`\n📝 Processed Message ${index + 1}:`, {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      hasText: 'text' in message,
      hasMessage: 'message' in message,
      textValue: message.text,
      messageValue: message.message,
      isOwn: message.isOwn,
      timestamp: message.timestamp,
      time: message.time,
      read: message.read
    });
  });

  return true;
}

// Test 3: Check AgentApplication getData output
function testAgentApplicationGetData() {
  console.log("\n--- Test 3: AgentApplication getData Output ---");

  // Find an open AgentApplication
  const openWindows = Object.values(ui.windows);
  const agentApps = openWindows.filter(window =>
    window && window.constructor.name === 'AgentApplication'
  );

  if (agentApps.length === 0) {
    console.log("ℹ️ No AgentApplication windows found");
    return false;
  }

  const agentApp = agentApps[0];
  console.log(`📱 Found AgentApplication:`, {
    actor: agentApp.actor?.name,
    currentView: agentApp.currentView,
    currentContact: agentApp.currentContact?.name
  });

  // Test getData for conversation view
  if (agentApp.currentView === 'conversation' && agentApp.currentContact) {
    const templateData = agentApp.getData();

    console.log(`📊 Template data for conversation view:`, {
      messagesCount: templateData.messages?.length || 0,
      contact: templateData.contact?.name,
      currentTime: templateData.currentTime
    });

    if (templateData.messages && templateData.messages.length > 0) {
      console.log(`\n📝 First message in template data:`, {
        id: templateData.messages[0].id,
        senderId: templateData.messages[0].senderId,
        receiverId: templateData.messages[0].receiverId,
        hasText: 'text' in templateData.messages[0],
        hasMessage: 'message' in templateData.messages[0],
        textValue: templateData.messages[0].text,
        messageValue: templateData.messages[0].message,
        isOwn: templateData.messages[0].isOwn,
        time: templateData.messages[0].time
      });
    }
  } else {
    console.log("ℹ️ AgentApplication is not in conversation view");
  }

  return true;
}

// Test 4: Check template rendering
function testTemplateRendering() {
  console.log("\n--- Test 4: Template Rendering ---");

  // Find an open AgentApplication in conversation view
  const openWindows = Object.values(ui.windows);
  const agentApps = openWindows.filter(window =>
    window && window.constructor.name === 'AgentApplication' &&
    window.currentView === 'conversation'
  );

  if (agentApps.length === 0) {
    console.log("ℹ️ No AgentApplication in conversation view found");
    return false;
  }

  const agentApp = agentApps[0];

  // Check the rendered HTML
  const html = agentApp.element[0];
  const messageElements = html.querySelectorAll('.cp-message-text');

  console.log(`📊 Found ${messageElements.length} message text elements in rendered HTML`);

  messageElements.forEach((element, index) => {
    console.log(`\n📝 Message text element ${index + 1}:`, {
      textContent: element.textContent,
      innerHTML: element.innerHTML,
      hasContent: element.textContent.trim().length > 0
    });
  });

  return true;
}

// Test 5: Send a test message and check its structure
async function testSendMessage() {
  console.log("\n--- Test 5: Send Test Message ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const instance = window.CyberpunkAgent.instance;

  // Get the first available actor
  const actors = game.actors.filter(actor => actor.type === 'character');
  if (actors.length === 0) {
    console.log("ℹ️ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log(`🎭 Using test actor: ${testActor.name} (${testActor.id})`);

  // Get contacts for this actor
  const contacts = instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.log("ℹ️ No contacts found for test actor");
    return false;
  }

  const testContact = contacts[0];
  console.log(`👤 Using test contact: ${testContact.name} (${testContact.id})`);

  // Send a test message
  const testMessageText = `Test message at ${new Date().toLocaleTimeString()}`;
  console.log(`📤 Sending test message: "${testMessageText}"`);

  const success = await instance.sendMessage(testActor.id, testContact.id, testMessageText);

  if (success) {
    console.log("✅ Test message sent successfully");

    // Check the message structure immediately after sending
    const messages = instance.getMessagesForConversation(testActor.id, testContact.id);
    const lastMessage = messages[messages.length - 1];

    console.log(`\n📝 Last message structure:`, {
      id: lastMessage.id,
      senderId: lastMessage.senderId,
      receiverId: lastMessage.receiverId,
      hasText: 'text' in lastMessage,
      hasMessage: 'message' in lastMessage,
      textValue: lastMessage.text,
      messageValue: lastMessage.message,
      isOwn: lastMessage.isOwn,
      timestamp: lastMessage.timestamp,
      time: lastMessage.time,
      read: lastMessage.read
    });
  } else {
    console.error("❌ Failed to send test message");
  }

  return success;
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting message content debug tests...\n");

  const results = {
    dataStructure: testMessageDataStructure(),
    getMessages: testGetMessagesForConversation(),
    getData: testAgentApplicationGetData(),
    templateRendering: testTemplateRendering(),
    sendMessage: await testSendMessage()
  };

  console.log("\n=== Test Results Summary ===");
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
  });

  console.log("\n🔍 Debug complete. Check the output above for message structure issues.");
}

// Run the tests
runAllTests(); 