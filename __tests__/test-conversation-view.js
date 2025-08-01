/**
 * Test Conversation View
 * Tests the conversation view rendering and ensures no DOM manipulation errors
 */

console.log("Cyberpunk Agent | Loading test-conversation-view.js...");

/**
 * Test conversation view rendering
 */
function testConversationViewRendering() {
  console.log("🧪 Testing conversation view rendering...");

  if (!window.AgentApplication) {
    console.error("❌ AgentApplication not available");
    return false;
  }

  // Create a test actor and contact
  const testActor = { id: 'test-actor-123', name: 'Test Actor' };
  const testContact = { id: 'test-contact-456', name: 'Test Contact', img: 'path/to/image.jpg' };

  // Create test messages
  const testMessages = [
    {
      id: 'msg-1',
      senderId: testActor.id,
      receiverId: testContact.id,
      text: 'Hello from actor!',
      timestamp: Date.now() - 60000,
      time: '10:30',
      read: true
    },
    {
      id: 'msg-2',
      senderId: testContact.id,
      receiverId: testActor.id,
      text: 'Hello from contact!',
      timestamp: Date.now() - 30000,
      time: '10:31',
      read: false
    }
  ];

  // Mock the CyberpunkAgent instance
  const originalInstance = window.CyberpunkAgent?.instance;
  window.CyberpunkAgent = window.CyberpunkAgent || {};
  window.CyberpunkAgent.instance = {
    getMessagesForConversation: (actorId, contactId) => {
      console.log(`Mock: Getting messages for ${actorId} and ${contactId}`);
      return testMessages;
    },
    markConversationAsRead: (actorId, contactId) => {
      console.log(`Mock: Marking conversation as read for ${actorId} and ${contactId}`);
    }
  };

  try {
    // Create an AgentApplication instance
    const agentApp = new AgentApplication(testActor);

    // Set the current view and contact
    agentApp.currentView = 'conversation';
    agentApp.currentContact = testContact;

    // Test the getData method
    const templateData = agentApp.getData();
    console.log("📋 Template data:", templateData);

    // Verify the data structure
    if (templateData.messages && Array.isArray(templateData.messages)) {
      console.log("✅ Messages array found in template data");

      // Check if messages have the required properties
      const firstMessage = templateData.messages[0];
      if (firstMessage && typeof firstMessage.isOwn === 'boolean') {
        console.log("✅ Messages have isOwn property");
      } else {
        console.error("❌ Messages missing isOwn property");
        return false;
      }

      if (firstMessage && firstMessage.time) {
        console.log("✅ Messages have time property");
      } else {
        console.error("❌ Messages missing time property");
        return false;
      }
    } else {
      console.error("❌ Messages not found in template data");
      return false;
    }

    if (templateData.contact && templateData.contact.id === testContact.id) {
      console.log("✅ Contact data found in template data");
    } else {
      console.error("❌ Contact data not found in template data");
      return false;
    }

    // Test the _renderConversationView method
    console.log("🔄 Testing _renderConversationView method...");
    agentApp._renderConversationView();
    console.log("✅ _renderConversationView completed without errors");

    console.log("✅ Conversation view rendering test passed");
    return true;

  } catch (error) {
    console.error("❌ Error in conversation view test:", error);
    return false;
  } finally {
    // Restore original instance
    if (originalInstance) {
      window.CyberpunkAgent.instance = originalInstance;
    } else {
      delete window.CyberpunkAgent.instance;
    }
  }
}

/**
 * Test template data formatting
 */
function testTemplateDataFormatting() {
  console.log("🧪 Testing template data formatting...");

  if (!window.AgentApplication) {
    console.error("❌ AgentApplication not available");
    return false;
  }

  const testActor = { id: 'format-test-actor', name: 'Format Test Actor' };
  const testContact = { id: 'format-test-contact', name: 'Format Test Contact' };

  // Test messages with different timestamps
  const testMessages = [
    {
      id: 'msg-1',
      senderId: testActor.id,
      receiverId: testContact.id,
      text: 'Own message',
      timestamp: Date.now() - 60000,
      read: true
    },
    {
      id: 'msg-2',
      senderId: testContact.id,
      receiverId: testActor.id,
      text: 'Other message',
      timestamp: Date.now() - 30000,
      read: false
    }
  ];

  // Mock the CyberpunkAgent instance
  const originalInstance = window.CyberpunkAgent?.instance;
  window.CyberpunkAgent = window.CyberpunkAgent || {};
  window.CyberpunkAgent.instance = {
    getMessagesForConversation: () => testMessages
  };

  try {
    const agentApp = new AgentApplication(testActor);
    agentApp.currentView = 'conversation';
    agentApp.currentContact = testContact;

    const templateData = agentApp.getData();
    const messages = templateData.messages;

    // Test message formatting
    if (messages.length === 2) {
      console.log("✅ Correct number of messages");
    } else {
      console.error("❌ Wrong number of messages");
      return false;
    }

    // Test first message (own message)
    const ownMessage = messages[0];
    if (ownMessage.isOwn === true) {
      console.log("✅ Own message correctly identified");
    } else {
      console.error("❌ Own message not correctly identified");
      return false;
    }

    // Test second message (other message)
    const otherMessage = messages[1];
    if (otherMessage.isOwn === false) {
      console.log("✅ Other message correctly identified");
    } else {
      console.error("❌ Other message not correctly identified");
      return false;
    }

    // Test time formatting
    if (ownMessage.time && otherMessage.time) {
      console.log("✅ Time formatting works");
    } else {
      console.error("❌ Time formatting failed");
      return false;
    }

    console.log("✅ Template data formatting test passed");
    return true;

  } catch (error) {
    console.error("❌ Error in template data formatting test:", error);
    return false;
  } finally {
    // Restore original instance
    if (originalInstance) {
      window.CyberpunkAgent.instance = originalInstance;
    } else {
      delete window.CyberpunkAgent.instance;
    }
  }
}

/**
 * Test conversation view navigation
 */
function testConversationViewNavigation() {
  console.log("🧪 Testing conversation view navigation...");

  if (!window.AgentApplication) {
    console.error("❌ AgentApplication not available");
    return false;
  }

  const testActor = { id: 'nav-test-actor', name: 'Navigation Test Actor' };
  const testContact = { id: 'nav-test-contact', name: 'Navigation Test Contact' };

  // Mock the CyberpunkAgent instance
  const originalInstance = window.CyberpunkAgent?.instance;
  window.CyberpunkAgent = window.CyberpunkAgent || {};
  window.CyberpunkAgent.instance = {
    getMessagesForConversation: () => [],
    markConversationAsRead: () => { }
  };

  try {
    const agentApp = new AgentApplication(testActor);

    // Test navigation to conversation view
    console.log("🔄 Testing navigation to conversation view...");
    agentApp.navigateTo('conversation', testContact);

    if (agentApp.currentView === 'conversation') {
      console.log("✅ Current view set to conversation");
    } else {
      console.error("❌ Current view not set to conversation");
      return false;
    }

    if (agentApp.currentContact && agentApp.currentContact.id === testContact.id) {
      console.log("✅ Current contact set correctly");
    } else {
      console.error("❌ Current contact not set correctly");
      return false;
    }

    // Test template path update
    if (agentApp.options.template.includes('chat-conversation.html')) {
      console.log("✅ Template path updated correctly");
    } else {
      console.error("❌ Template path not updated correctly");
      return false;
    }

    console.log("✅ Conversation view navigation test passed");
    return true;

  } catch (error) {
    console.error("❌ Error in conversation view navigation test:", error);
    return false;
  } finally {
    // Restore original instance
    if (originalInstance) {
      window.CyberpunkAgent.instance = originalInstance;
    } else {
      delete window.CyberpunkAgent.instance;
    }
  }
}

/**
 * Test error handling
 */
function testErrorHandling() {
  console.log("🧪 Testing error handling...");

  if (!window.AgentApplication) {
    console.error("❌ AgentApplication not available");
    return false;
  }

  const testActor = { id: 'error-test-actor', name: 'Error Test Actor' };

  try {
    const agentApp = new AgentApplication(testActor);
    agentApp.currentView = 'conversation';
    agentApp.currentContact = null; // This should trigger an error

    // Test _renderConversationView with no contact
    console.log("🔄 Testing _renderConversationView with no contact...");
    agentApp._renderConversationView();

    // If we get here without an error, the error handling is working
    console.log("✅ Error handling works correctly");
    return true;

  } catch (error) {
    console.error("❌ Unexpected error in error handling test:", error);
    return false;
  }
}

/**
 * Run all conversation view tests
 */
function runAllConversationViewTests() {
  console.log("🚀 Running all conversation view tests...");
  console.log("=".repeat(50));

  const tests = [
    { name: "Conversation View Rendering", fn: testConversationViewRendering },
    { name: "Template Data Formatting", fn: testTemplateDataFormatting },
    { name: "Conversation View Navigation", fn: testConversationViewNavigation },
    { name: "Error Handling", fn: testErrorHandling }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    console.log(`\n🧪 Running ${test.name} test...`);
    try {
      const result = test.fn();
      if (result) {
        console.log(`✅ ${test.name} test passed`);
        passed++;
      } else {
        console.log(`❌ ${test.name} test failed`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test error:`, error);
      failed++;
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All conversation view tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the logs above for details.");
  }

  return { passed, failed };
}

// Make functions globally available
window.testConversationViewRendering = testConversationViewRendering;
window.testTemplateDataFormatting = testTemplateDataFormatting;
window.testConversationViewNavigation = testConversationViewNavigation;
window.testErrorHandling = testErrorHandling;
window.runAllConversationViewTests = runAllConversationViewTests;

console.log("Cyberpunk Agent | test-conversation-view.js loaded successfully");
console.log("Available test functions:");
console.log("- testConversationViewRendering()");
console.log("- testTemplateDataFormatting()");
console.log("- testConversationViewNavigation()");
console.log("- testErrorHandling()");
console.log("- runAllConversationViewTests()"); 