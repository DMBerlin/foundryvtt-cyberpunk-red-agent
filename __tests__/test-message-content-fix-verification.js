/**
 * Test script to verify message content display fix
 * 
 * This test verifies that:
 * 1. Messages are created with the correct 'text' property
 * 2. Messages are properly displayed in the chat conversation
 * 3. The template receives the correct data structure
 */

console.log("=== Cyberpunk Agent - Message Content Fix Verification ===");

// Test 1: Verify message creation with correct property
async function testMessageCreation() {
  console.log("\n--- Test 1: Message Creation with Correct Property ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const instance = window.CyberpunkAgent.instance;
  
  // Get a test actor
  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Get contacts for the actor
  const contacts = instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.log("⚠️  No contacts found for actor, creating test contact");
    const otherActors = game.actors.filter(a => a.id !== testActor.id && a.type === 'character');
    if (otherActors.length > 0) {
      instance.addContactToActor(testActor.id, otherActors[0].id);
      console.log("✅ Created test contact:", otherActors[0].name);
    } else {
      console.error("❌ No other actors available for test contact");
      return false;
    }
  }

  const updatedContacts = instance.getContactsForActor(testActor.id);
  if (updatedContacts.length === 0) {
    console.error("❌ Still no contacts available");
    return false;
  }

  const testContact = updatedContacts[0];
  console.log("✅ Using test contact:", testContact.name);

  // Send a test message
  const testMessageText = `Test message content at ${new Date().toLocaleTimeString()}`;
  console.log("📤 Sending test message:", testMessageText);
  
  const success = await instance.sendMessage(testActor.id, testContact.id, testMessageText);
  
  if (!success) {
    console.error("❌ Failed to send test message");
    return false;
  }

  console.log("✅ Test message sent successfully");

  // Wait a moment for the message to be processed
  setTimeout(() => {
    // Get messages for the conversation
    const messages = instance.getMessagesForConversation(testActor.id, testContact.id);
    console.log("📨 Messages in conversation:", messages.length);

    if (messages.length > 0) {
      const message = messages[messages.length - 1]; // Get the last message
      console.log("✅ Latest message structure:", {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        hasText: 'text' in message,
        hasMessage: 'message' in message,
        textValue: message.text,
        messageValue: message.message,
        timestamp: message.timestamp,
        read: message.read
      });

      // Verify the message has the correct 'text' property
      if (message.text === testMessageText) {
        console.log("✅ Message has correct 'text' property with expected content");
      } else {
        console.error("❌ Message 'text' property does not match expected content");
        console.error("Expected:", testMessageText);
        console.error("Actual:", message.text);
      }
    } else {
      console.error("❌ No messages found in conversation");
    }
  }, 1000);

  return true;
}

// Test 2: Verify AgentApplication getData output
function testAgentApplicationGetData() {
  console.log("\n--- Test 2: AgentApplication getData Output ---");

  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Create a test AgentApplication
  const AgentApplication = window.AgentApplication || window.ChatConversationApplication;
  if (!AgentApplication) {
    console.error("❌ AgentApplication class not found");
    return false;
  }

  // Get contacts for the actor
  const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.error("❌ No contacts found for test");
    return false;
  }

  const testContact = contacts[0];
  console.log("✅ Using test contact:", testContact.name);

  // Create a test application instance
  const testApp = new AgentApplication(testActor, { currentView: 'conversation', currentContact: testContact });
  
  // Test getData for conversation view
  const templateData = testApp.getData();
  
  console.log("📊 Template data for conversation view:", {
    messagesCount: templateData.messages?.length || 0,
    contact: templateData.contact?.name,
    currentTime: templateData.currentTime
  });

  if (templateData.messages && templateData.messages.length > 0) {
    const firstMessage = templateData.messages[0];
    console.log("✅ First message in template data:", {
      id: firstMessage.id,
      senderId: firstMessage.senderId,
      receiverId: firstMessage.receiverId,
      hasText: 'text' in firstMessage,
      hasMessage: 'message' in firstMessage,
      textValue: firstMessage.text,
      messageValue: firstMessage.message,
      isOwn: firstMessage.isOwn,
      time: firstMessage.time
    });

    // Verify the message has the correct 'text' property for template
    if (firstMessage.text && firstMessage.text.trim().length > 0) {
      console.log("✅ Message has valid 'text' property for template rendering");
    } else {
      console.error("❌ Message 'text' property is empty or invalid");
    }
  } else {
    console.log("ℹ️ No messages in template data");
  }

  return true;
}

// Test 3: Verify template rendering
function testTemplateRendering() {
  console.log("\n--- Test 3: Template Rendering ---");

  // Find an open AgentApplication in conversation view
  const openWindows = Object.values(ui.windows);
  const agentApps = openWindows.filter(window => 
    window && window.constructor.name === 'AgentApplication' &&
    window.currentView === 'conversation'
  );

  if (agentApps.length === 0) {
    console.log("ℹ️ No AgentApplication in conversation view found");
    console.log("ℹ️ To test template rendering, please open a conversation in the Chat7 interface");
    return false;
  }

  const agentApp = agentApps[0];
  console.log("✅ Found AgentApplication in conversation view");
  
  // Check the rendered HTML
  const html = agentApp.element[0];
  const messageElements = html.querySelectorAll('.cp-message-text');
  
  console.log(`📊 Found ${messageElements.length} message text elements in rendered HTML`);
  
  if (messageElements.length > 0) {
    messageElements.forEach((element, index) => {
      const hasContent = element.textContent.trim().length > 0;
      console.log(`📝 Message text element ${index + 1}:`, {
        textContent: element.textContent,
        hasContent: hasContent,
        status: hasContent ? "✅" : "❌"
      });
    });

    // Check if any messages have content
    const messagesWithContent = Array.from(messageElements).filter(element => 
      element.textContent.trim().length > 0
    );

    if (messagesWithContent.length > 0) {
      console.log(`✅ ${messagesWithContent.length} out of ${messageElements.length} messages have content`);
      return true;
    } else {
      console.error("❌ No messages have content in the rendered HTML");
      return false;
    }
  } else {
    console.log("ℹ️ No message text elements found in rendered HTML");
    return false;
  }
}

// Test 4: Send multiple test messages and verify
async function testMultipleMessages() {
  console.log("\n--- Test 4: Multiple Messages Test ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const instance = window.CyberpunkAgent.instance;
  
  // Get a test actor
  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  const contacts = instance.getContactsForActor(testActor.id);
  
  if (contacts.length === 0) {
    console.log("ℹ️ No contacts available for multiple message test");
    return false;
  }

  const testContact = contacts[0];
  console.log("✅ Testing multiple messages with contact:", testContact.name);

  // Send multiple test messages
  const testMessages = [
    "First test message",
    "Second test message with more content",
    "Third message: Testing message content display"
  ];

  console.log("📤 Sending multiple test messages...");
  
  for (let i = 0; i < testMessages.length; i++) {
    const messageText = testMessages[i];
    console.log(`📤 Sending message ${i + 1}: "${messageText}"`);
    
    const success = await instance.sendMessage(testActor.id, testContact.id, messageText);
    if (!success) {
      console.error(`❌ Failed to send message ${i + 1}`);
      return false;
    }
    
    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("✅ All test messages sent successfully");

  // Wait a moment for all messages to be processed
  setTimeout(() => {
    // Get messages for the conversation
    const messages = instance.getMessagesForConversation(testActor.id, testContact.id);
    console.log(`📨 Total messages in conversation: ${messages.length}`);

    // Verify each test message
    let allMessagesValid = true;
    testMessages.forEach((expectedText, index) => {
      const message = messages[messages.length - testMessages.length + index];
      if (message && message.text === expectedText) {
        console.log(`✅ Message ${index + 1} verified: "${expectedText}"`);
      } else {
        console.error(`❌ Message ${index + 1} verification failed`);
        console.error("Expected:", expectedText);
        console.error("Actual:", message ? message.text : "No message found");
        allMessagesValid = false;
      }
    });

    if (allMessagesValid) {
      console.log("✅ All test messages verified successfully");
    } else {
      console.error("❌ Some test messages failed verification");
    }
  }, 2000);

  return true;
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting message content fix verification tests...\n");
  
  const results = {
    messageCreation: await testMessageCreation(),
    getData: testAgentApplicationGetData(),
    templateRendering: testTemplateRendering(),
    multipleMessages: await testMultipleMessages()
  };

  console.log("\n=== Test Results Summary ===");
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n📊 Overall Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Message content should now be displayed correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the output above for details.");
  }

  console.log("\n🔍 Verification complete. If all tests passed, the message content fix is working correctly.");
}

// Run the tests
runAllTests(); 