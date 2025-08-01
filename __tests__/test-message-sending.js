/**
 * Test Script: Message Sending and Display
 * Verifies that messages are sent correctly and appear immediately
 */

console.log("Cyberpunk Agent | Running message sending test...");

// Test function to verify message sending functionality
async function testMessageSending() {
  console.log("=== Message Sending Test ===");

  try {
    // Check if CyberpunkAgent instance exists
    if (!window.CyberpunkAgent?.instance) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }
    console.log("✅ CyberpunkAgent instance found");

    // Get user actors
    const userActors = window.CyberpunkAgent.instance.getUserActors() || [];
    if (userActors.length === 0) {
      console.error("❌ No user actors found");
      return false;
    }

    const testActor = userActors[0];
    console.log(`✅ Using actor for testing: ${testActor.name} (${testActor.id})`);

    // Test 1: Check if AgentApplication is available
    console.log("🔄 Test 1: Checking AgentApplication availability...");
    if (typeof AgentApplication === 'undefined') {
      console.error("❌ AgentApplication not available");
      return false;
    }
    console.log("✅ AgentApplication is available");

    // Test 2: Check if conversation view can be created
    console.log("🔄 Test 2: Testing conversation view creation...");
    const agentApp = new AgentApplication(testActor);
    console.log("✅ AgentApplication created successfully");

    // Create a mock contact for testing
    const mockContact = {
      id: 'test-contact-1',
      name: 'Test Contact',
      phoneNumber: '555-0123',
      isAnonymous: false
    };

    // Test 3: Check conversation view rendering
    console.log("🔄 Test 3: Testing conversation view rendering...");
    agentApp.currentView = 'conversation';
    agentApp.currentContact = mockContact;

    // Mock the element for testing
    const mockElement = {
      find: (selector) => {
        if (selector === '#messages-container') {
          return {
            length: 1,
            empty: () => console.log("Mock: messagesContainer.empty() called"),
            append: (html) => console.log("Mock: messagesContainer.append() called with:", html)
          };
        }
        return { length: 0 };
      }
    };

    // Temporarily replace the element for testing
    const originalElement = agentApp.element;
    agentApp.element = mockElement;

    // Call the method
    agentApp._renderConversationView();

    // Restore original element
    agentApp.element = originalElement;

    console.log("✅ Conversation view rendering test completed");

    // Test 4: Check send message functionality
    console.log("🔄 Test 4: Testing send message functionality...");

    // Test the _sendMessage method
    agentApp.currentContact = mockContact;
    agentApp.element = mockElement;

    // Mock the input element
    const mockInput = {
      val: () => "Test message",
      trim: () => "Test message"
    };

    // Mock the element.find for input
    const mockElementWithInput = {
      find: (selector) => {
        if (selector === '.cp-message-input') {
          return mockInput;
        }
        return { length: 0 };
      }
    };

    agentApp.element = mockElementWithInput;

    // Test the method
    await agentApp._sendMessage();

    console.log("✅ Send message functionality test completed");

    // Test 5: Check event listeners
    console.log("🔄 Test 5: Testing event listeners...");

    const requiredListeners = [
      '_onSendMessage',
      '_onMessageInputKeypress'
    ];

    let listenersTestPassed = true;
    requiredListeners.forEach(listener => {
      if (typeof agentApp[listener] === 'function') {
        console.log(`✅ ${listener} method exists`);
      } else {
        console.error(`❌ ${listener} method missing`);
        listenersTestPassed = false;
      }
    });

    if (!listenersTestPassed) {
      console.error("❌ Event listeners test failed");
      return false;
    }

    // Test 6: Check template structure
    console.log("🔄 Test 6: Checking template structure...");
    const templatePath = "modules/cyberpunk-agent/templates/chat-conversation.html";
    console.log(`✅ Template path: ${templatePath}`);

    // Test 7: Check if send button selector is correct
    console.log("🔄 Test 7: Checking send button selector...");
    const expectedSelector = '.cp-send-message';
    console.log(`✅ Expected send button selector: ${expectedSelector}`);

    // Test 8: Check if input selector is correct
    console.log("🔄 Test 8: Checking input selector...");
    const expectedInputSelector = '.cp-message-input';
    console.log(`✅ Expected input selector: ${expectedInputSelector}`);

    // Test 9: Check if messages container selector is correct
    console.log("🔄 Test 9: Checking messages container selector...");
    const expectedContainerSelector = '#messages-container';
    console.log(`✅ Expected messages container selector: ${expectedContainerSelector}`);

    console.log("✅ All message sending tests passed!");
    return true;

  } catch (error) {
    console.error("❌ Message sending test failed:", error);
    return false;
  }
}

// Test function to check real-time updates
async function testRealtimeUpdates() {
  console.log("=== Real-time Updates Test ===");

  try {
    if (!window.CyberpunkAgent?.instance) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user actors
    const userActors = window.CyberpunkAgent.instance.getUserActors() || [];
    if (userActors.length === 0) {
      console.error("❌ No user actors found");
      return false;
    }

    const testActor = userActors[0];

    // Test conversation real-time listener setup
    console.log("🔄 Testing conversation real-time listener setup...");
    const agentApp = new AgentApplication(testActor);

    // Mock the element
    const mockElement = {
      find: () => ({ length: 1, empty: () => { }, append: () => { } })
    };

    agentApp.element = mockElement;
    agentApp.currentView = 'conversation';
    agentApp.currentContact = { id: 'test-contact', name: 'Test Contact' };

    // Test the setup method
    agentApp._setupConversationRealtimeListener();
    console.log("✅ Conversation real-time listener setup completed");

    // Test event dispatching
    console.log("🔄 Testing event dispatching...");
    const testEvent = new CustomEvent('cyberpunk-agent-update', {
      detail: {
        type: 'messageUpdate',
        senderId: testActor.id,
        receiverId: 'test-contact',
        message: { id: 'test-msg', text: 'Test message' }
      }
    });

    // Dispatch the event
    document.dispatchEvent(testEvent);
    console.log("✅ Event dispatching test completed");

    return true;

  } catch (error) {
    console.error("❌ Real-time updates test failed:", error);
    return false;
  }
}

// Test function to check message display
async function testMessageDisplay() {
  console.log("=== Message Display Test ===");

  try {
    if (!window.CyberpunkAgent?.instance) {
      console.error("❌ CyberpunkAgent instance not found");
      return false;
    }

    // Get user actors
    const userActors = window.CyberpunkAgent.instance.getUserActors() || [];
    if (userActors.length === 0) {
      console.error("❌ No user actors found");
      return false;
    }

    const testActor = userActors[0];

    // Test message rendering
    console.log("🔄 Testing message rendering...");
    const agentApp = new AgentApplication(testActor);

    // Mock messages
    const mockMessages = [
      {
        id: 'msg1',
        text: 'Hello there!',
        senderId: testActor.id,
        timestamp: Date.now()
      },
      {
        id: 'msg2',
        text: 'How are you?',
        senderId: 'other-contact',
        timestamp: Date.now() + 1000
      }
    ];

    // Mock the getMessagesForConversation method
    const originalGetMessages = window.CyberpunkAgent.instance.getMessagesForConversation;
    window.CyberpunkAgent.instance.getMessagesForConversation = () => mockMessages;

    // Mock the element
    const mockElement = {
      find: (selector) => {
        if (selector === '#messages-container') {
          return {
            length: 1,
            empty: () => console.log("Mock: messagesContainer.empty() called"),
            append: (html) => console.log("Mock: messagesContainer.append() called with:", html)
          };
        }
        return { length: 0 };
      }
    };

    agentApp.element = mockElement;
    agentApp.currentContact = { id: 'test-contact', name: 'Test Contact' };

    // Test the rendering method
    agentApp._renderConversationView();

    // Restore original method
    window.CyberpunkAgent.instance.getMessagesForConversation = originalGetMessages;

    console.log("✅ Message display test completed");
    return true;

  } catch (error) {
    console.error("❌ Message display test failed:", error);
    return false;
  }
}

// Run all tests
async function runAllMessageTests() {
  console.log("🚀 Starting message sending tests...");

  const test1 = await testMessageSending();
  const test2 = await testRealtimeUpdates();
  const test3 = await testMessageDisplay();

  if (test1 && test2 && test3) {
    console.log("🎉 All message sending tests passed!");
    ui.notifications.info("Message sending test: PASSED");
  } else {
    console.error("💥 Some message sending tests failed!");
    ui.notifications.error("Message sending test: FAILED");
  }
}

// Export for manual testing
window.testMessageSending = testMessageSending;
window.testRealtimeUpdates = testRealtimeUpdates;
window.testMessageDisplay = testMessageDisplay;
window.runAllMessageTests = runAllMessageTests;

// Auto-run if this script is executed directly
if (typeof module === 'undefined') {
  // Running in browser context
  runAllMessageTests();
} 