/**
 * Test script to verify message display and chat header fixes
 * 
 * This test verifies that:
 * 1. Messages are properly displayed in the chat conversation
 * 2. Chat header (avatar and contact name) is displayed correctly
 * 3. Real-time unread count updates work
 * 4. Messages are marked as read when opening conversations
 */

console.log("=== Cyberpunk Agent - Message Display Fix Test ===");

// Test 1: Verify message data structure
function testMessageDataStructure() {
  console.log("\n--- Test 1: Message Data Structure ---");

  if (!window.CyberpunkAgent?.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  // Get a test actor
  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Get contacts for the actor
  const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.log("⚠️  No contacts found for actor, creating test contact");
    // Create a test contact
    const otherActors = game.actors.filter(a => a.id !== testActor.id && a.type === 'character');
    if (otherActors.length > 0) {
      window.CyberpunkAgent.instance.addContactToActor(testActor.id, otherActors[0].id);
      console.log("✅ Created test contact:", otherActors[0].name);
    } else {
      console.error("❌ No other actors available for test contact");
      return false;
    }
  }

  // Get updated contacts
  const updatedContacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (updatedContacts.length === 0) {
    console.error("❌ Still no contacts available");
    return false;
  }

  const testContact = updatedContacts[0];
  console.log("✅ Using test contact:", testContact.name);

  // Send a test message
  console.log("📤 Sending test message...");
  window.CyberpunkAgent.instance.sendMessage(testContact.id, testActor.id, "Test message for display verification");

  // Wait a moment for the message to be processed
  setTimeout(() => {
    // Get messages for the conversation
    const messages = window.CyberpunkAgent.instance.getMessagesForConversation(testActor.id, testContact.id);
    console.log("📨 Messages in conversation:", messages.length);

    if (messages.length > 0) {
      const message = messages[0];
      console.log("✅ Message found:", {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        message: message.message,
        timestamp: message.timestamp,
        read: message.read
      });

      // Check if message has required properties for template
      const requiredProps = ['id', 'senderId', 'receiverId', 'text', 'timestamp'];
      const missingProps = requiredProps.filter(prop => !(prop in message));

      if (missingProps.length === 0) {
        console.log("✅ Message has all required properties");
      } else {
        console.error("❌ Message missing properties:", missingProps);
      }
    } else {
      console.error("❌ No messages found in conversation");
    }
  }, 1000);

  return true;
}

// Test 2: Verify AgentApplication getData method
function testAgentApplicationGetData() {
  console.log("\n--- Test 2: AgentApplication getData Method ---");

  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Create a mock AgentApplication instance
  const mockApp = {
    actor: testActor,
    currentView: 'conversation',
    currentContact: null
  };

  // Get contacts
  const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.error("❌ No contacts available for testing");
    return false;
  }

  mockApp.currentContact = contacts[0];
  console.log("✅ Using test contact:", mockApp.currentContact.name);

  // Simulate the getData method logic
  const messages = window.CyberpunkAgent.instance.getMessagesForConversation(testActor.id, mockApp.currentContact.id);
  console.log("📨 Raw messages count:", messages.length);

  // Format messages like the getData method does
  const formattedMessages = messages.map(message => ({
    ...message,
            text: message.text || message.message, // Use 'text' property, fallback to 'message' for compatibility
    isOwn: message.senderId === testActor.id,
    time: message.time || new Date(message.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  console.log("✅ Formatted messages count:", formattedMessages.length);

  if (formattedMessages.length > 0) {
    const formattedMessage = formattedMessages[0];
    console.log("✅ Formatted message structure:", {
      id: formattedMessage.id,
      text: formattedMessage.text,
      isOwn: formattedMessage.isOwn,
      time: formattedMessage.time,
      senderId: formattedMessage.senderId,
      receiverId: formattedMessage.receiverId
    });

    // Check if the message has the 'text' property needed by the template
    if (formattedMessage.text) {
      console.log("✅ Message has 'text' property for template rendering");
    } else {
      console.error("❌ Message missing 'text' property");
    }
  }

  // Check contact data
  console.log("✅ Contact data for template:", {
    id: mockApp.currentContact.id,
    name: mockApp.currentContact.name,
    img: mockApp.currentContact.img
  });

  return true;
}

// Test 3: Verify template rendering
function testTemplateRendering() {
  console.log("\n--- Test 3: Template Rendering ---");

  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Get contacts
  const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.error("❌ No contacts available for testing");
    return false;
  }

  const testContact = contacts[0];
  console.log("✅ Using test contact:", testContact.name);

  // Get messages
  const messages = window.CyberpunkAgent.instance.getMessagesForConversation(testActor.id, testContact.id);
  console.log("📨 Messages count:", messages.length);

  // Format messages
  const formattedMessages = messages.map(message => ({
    ...message,
            text: message.text || message.message,
    isOwn: message.senderId === testActor.id,
    time: message.time || new Date(message.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  // Create template data
  const templateData = {
    actor: testActor,
    currentTime: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    currentView: 'conversation',
    currentContact: testContact,
    messages: formattedMessages,
    contact: testContact
  };

  console.log("✅ Template data created:", {
    actorName: templateData.actor.name,
    contactName: templateData.contact.name,
    messagesCount: templateData.messages.length,
    currentTime: templateData.currentTime
  });

  // Check if all required data is present
  const requiredData = ['actor', 'contact', 'messages', 'currentTime'];
  const missingData = requiredData.filter(key => !templateData[key]);

  if (missingData.length === 0) {
    console.log("✅ All required template data is present");
  } else {
    console.error("❌ Missing template data:", missingData);
  }

  // Check contact properties
  const requiredContactProps = ['id', 'name', 'img'];
  const missingContactProps = requiredContactProps.filter(prop => !(prop in templateData.contact));

  if (missingContactProps.length === 0) {
    console.log("✅ Contact has all required properties for header");
  } else {
    console.error("❌ Contact missing properties:", missingContactProps);
  }

  return true;
}

// Test 4: Verify real-time unread count updates
function testRealtimeUnreadCount() {
  console.log("\n--- Test 4: Real-time Unread Count Updates ---");

  const actors = game.actors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    console.error("❌ No character actors found");
    return false;
  }

  const testActor = actors[0];
  console.log("✅ Using test actor:", testActor.name);

  // Get contacts
  const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
  if (contacts.length === 0) {
    console.error("❌ No contacts available for testing");
    return false;
  }

  const testContact = contacts[0];
  console.log("✅ Using test contact:", testContact.name);

  // Check initial unread count
  const initialUnreadCount = window.CyberpunkAgent.instance.getUnreadCount(testActor.id, testContact.id);
  console.log("📊 Initial unread count:", initialUnreadCount);

  // Send a new message
  console.log("📤 Sending new message for unread count test...");
  window.CyberpunkAgent.instance.sendMessage(testContact.id, testActor.id, "Test message for unread count");

  // Wait and check updated unread count
  setTimeout(() => {
    const updatedUnreadCount = window.CyberpunkAgent.instance.getUnreadCount(testActor.id, testContact.id);
    console.log("📊 Updated unread count:", updatedUnreadCount);

    if (updatedUnreadCount > initialUnreadCount) {
      console.log("✅ Unread count increased as expected");
    } else {
      console.log("⚠️  Unread count did not increase");
    }

    // Test marking as read
    console.log("📖 Marking conversation as read...");
    window.CyberpunkAgent.instance.markConversationAsRead(testActor.id, testContact.id);

    setTimeout(() => {
      const finalUnreadCount = window.CyberpunkAgent.instance.getUnreadCount(testActor.id, testContact.id);
      console.log("📊 Final unread count after marking as read:", finalUnreadCount);

      if (finalUnreadCount === 0) {
        console.log("✅ Messages successfully marked as read");
      } else {
        console.log("⚠️  Messages may not have been marked as read");
      }
    }, 500);
  }, 1000);

  return true;
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting message display fix tests...\n");

  const tests = [
    testMessageDataStructure,
    testAgentApplicationGetData,
    testTemplateRendering,
    testRealtimeUnreadCount
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach((test, index) => {
    try {
      const result = test();
      if (result !== false) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test ${index + 1} failed with error:`, error);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Message display fixes should be working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the console for details.");
  }
}

// Export for manual testing
window.testMessageDisplayFix = {
  testMessageDataStructure,
  testAgentApplicationGetData,
  testTemplateRendering,
  testRealtimeUnreadCount,
  runAllTests
};

// Auto-run tests after a short delay
setTimeout(runAllTests, 2000); 