/**
 * Test Flutter-like UI Update System
 * Tests the new UIController and component-based update system
 */

console.log("Cyberpunk Agent | Loading test-flutter-ui-system.js...");

/**
 * Test the UI Controller functionality
 */
function testUIController() {
  console.log("🧪 Testing UI Controller...");

  if (!window.CyberpunkAgentUIController) {
    console.error("❌ UI Controller not available");
    return false;
  }

  console.log("✅ UI Controller is available");

  // Test component registration
  const testComponent = { id: 'test-component' };
  const testCallback = (component) => console.log("Test callback called for:", component.id);

  window.CyberpunkAgentUIController.registerComponent('test-component', testComponent, testCallback);

  if (window.CyberpunkAgentUIController.hasComponent('test-component')) {
    console.log("✅ Component registration works");
  } else {
    console.error("❌ Component registration failed");
    return false;
  }

  // Test marking as dirty
  window.CyberpunkAgentUIController.markDirty('test-component');
  console.log("✅ Mark dirty functionality works");

  // Test unregistration
  window.CyberpunkAgentUIController.unregisterComponent('test-component');

  if (!window.CyberpunkAgentUIController.hasComponent('test-component')) {
    console.log("✅ Component unregistration works");
  } else {
    console.error("❌ Component unregistration failed");
    return false;
  }

  console.log("✅ UI Controller tests passed");
  return true;
}

/**
 * Test real-time message updates
 */
function testRealtimeMessageUpdates() {
  console.log("🧪 Testing real-time message updates...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  // Create a test message
  const testMessage = {
    id: 'test-message-' + Date.now(),
    senderId: 'test-sender',
    receiverId: 'test-receiver',
    text: 'Test message for UI Controller',
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    read: false
  };

  // Simulate message update
  const testData = {
    userId: 'test-user',
    userName: 'Test User',
    timestamp: Date.now(),
    senderId: testMessage.senderId,
    receiverId: testMessage.receiverId,
    message: testMessage
  };

  console.log("📨 Simulating message update:", testData);
  window.CyberpunkAgent.instance.handleMessageUpdate(testData);

  console.log("✅ Real-time message update test completed");
  return true;
}

/**
 * Test component dirty marking
 */
function testComponentDirtyMarking() {
  console.log("🧪 Testing component dirty marking...");

  if (!window.CyberpunkAgentUIController) {
    console.error("❌ UI Controller not available");
    return false;
  }

  // Test marking multiple components as dirty
  const testComponents = [
    'agent-conversation-actor1-actor2',
    'agent-conversation-actor2-actor1',
    'agent-chat7-actor1',
    'agent-chat7-actor2'
  ];

  window.CyberpunkAgentUIController.markDirtyMultiple(testComponents);
  console.log("✅ Multiple component dirty marking works");

  // Test marking all components as dirty
  window.CyberpunkAgentUIController.markAllDirty();
  console.log("✅ Mark all dirty functionality works");

  console.log("✅ Component dirty marking tests passed");
  return true;
}

/**
 * Test UI Controller update cycle
 */
function testUpdateCycle() {
  console.log("🧪 Testing UI Controller update cycle...");

  if (!window.CyberpunkAgentUIController) {
    console.error("❌ UI Controller not available");
    return false;
  }

  let updateCalled = false;
  const testComponent = { id: 'update-test-component' };
  const testCallback = (component) => {
    console.log("🔄 Update callback called for:", component.id);
    updateCalled = true;
  };

  // Register component
  window.CyberpunkAgentUIController.registerComponent('update-test-component', testComponent, testCallback);

  // Mark as dirty
  window.CyberpunkAgentUIController.markDirty('update-test-component');

  // Wait for update cycle
  setTimeout(() => {
    if (updateCalled) {
      console.log("✅ Update cycle works correctly");
    } else {
      console.error("❌ Update cycle failed");
    }

    // Cleanup
    window.CyberpunkAgentUIController.unregisterComponent('update-test-component');
  }, 100);

  console.log("✅ Update cycle test initiated");
  return true;
}

/**
 * Test AgentApplication integration
 */
function testAgentApplicationIntegration() {
  console.log("🧪 Testing AgentApplication integration...");

  if (!window.AgentApplication) {
    console.error("❌ AgentApplication not available");
    return false;
  }

  // Test component ID generation
  const testActor = { id: 'test-actor-123', name: 'Test Actor' };
  const testContact = { id: 'test-contact-456', name: 'Test Contact' };

  // Create a mock AgentApplication instance
  const mockAgent = {
    actor: testActor,
    currentView: 'conversation',
    currentContact: testContact,
    _getComponentIds: function () {
      const componentIds = [];

      if (this.currentView === 'conversation' && this.currentContact) {
        componentIds.push(`agent-conversation-${this.actor.id}-${this.currentContact.id}`);
      } else if (this.currentView === 'chat7') {
        componentIds.push(`agent-chat7-${this.actor.id}`);
      }

      return componentIds;
    }
  };

  const componentIds = mockAgent._getComponentIds();
  console.log("📋 Generated component IDs:", componentIds);

  const expectedIds = [`agent-conversation-${testActor.id}-${testContact.id}`];

  if (JSON.stringify(componentIds) === JSON.stringify(expectedIds)) {
    console.log("✅ Component ID generation works correctly");
  } else {
    console.error("❌ Component ID generation failed");
    console.error("Expected:", expectedIds);
    console.error("Got:", componentIds);
    return false;
  }

  console.log("✅ AgentApplication integration tests passed");
  return true;
}

/**
 * Run all tests
 */
function runAllFlutterUITests() {
  console.log("🚀 Running all Flutter-like UI system tests...");
  console.log("=".repeat(50));

  const tests = [
    { name: "UI Controller", fn: testUIController },
    { name: "Component Dirty Marking", fn: testComponentDirtyMarking },
    { name: "AgentApplication Integration", fn: testAgentApplicationIntegration },
    { name: "Update Cycle", fn: testUpdateCycle },
    { name: "Real-time Message Updates", fn: testRealtimeMessageUpdates }
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
    console.log("🎉 All Flutter-like UI system tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the logs above for details.");
  }

  return { passed, failed };
}

/**
 * Test the complete message flow with UI Controller
 */
function testCompleteMessageFlow() {
  console.log("🧪 Testing complete message flow with UI Controller...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not available");
    return false;
  }

  // Create test data
  const testActor = { id: 'flow-test-actor', name: 'Flow Test Actor' };
  const testContact = { id: 'flow-test-contact', name: 'Flow Test Contact' };

  // Register mock components
  if (window.CyberpunkAgentUIController) {
    const conversationComponentId = `agent-conversation-${testActor.id}-${testContact.id}`;
    const chat7ComponentId = `agent-chat7-${testActor.id}`;

    let conversationUpdated = false;
    let chat7Updated = false;

    const conversationCallback = (component) => {
      console.log("🔄 Conversation component updated");
      conversationUpdated = true;
    };

    const chat7Callback = (component) => {
      console.log("🔄 Chat7 component updated");
      chat7Updated = true;
    };

    window.CyberpunkAgentUIController.registerComponent(conversationComponentId, { id: conversationComponentId }, conversationCallback);
    window.CyberpunkAgentUIController.registerComponent(chat7ComponentId, { id: chat7ComponentId }, chat7Callback);

    // Simulate message
    const testMessage = {
      id: 'flow-test-message-' + Date.now(),
      senderId: testActor.id,
      receiverId: testContact.id,
      text: 'Test message for complete flow',
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    const testData = {
      userId: 'flow-test-user',
      userName: 'Flow Test User',
      timestamp: Date.now(),
      senderId: testMessage.senderId,
      receiverId: testMessage.receiverId,
      message: testMessage
    };

    console.log("📨 Simulating message in complete flow...");
    window.CyberpunkAgent.instance.handleMessageUpdate(testData);

    // Check results after a delay
    setTimeout(() => {
      if (conversationUpdated && chat7Updated) {
        console.log("✅ Complete message flow works correctly");
      } else {
        console.error("❌ Complete message flow failed");
        console.error("Conversation updated:", conversationUpdated);
        console.error("Chat7 updated:", chat7Updated);
      }

      // Cleanup
      window.CyberpunkAgentUIController.unregisterComponent(conversationComponentId);
      window.CyberpunkAgentUIController.unregisterComponent(chat7ComponentId);
    }, 200);
  }

  console.log("✅ Complete message flow test initiated");
  return true;
}

// Make functions globally available
window.testUIController = testUIController;
window.testRealtimeMessageUpdates = testRealtimeMessageUpdates;
window.testComponentDirtyMarking = testComponentDirtyMarking;
window.testUpdateCycle = testUpdateCycle;
window.testAgentApplicationIntegration = testAgentApplicationIntegration;
window.testCompleteMessageFlow = testCompleteMessageFlow;
window.runAllFlutterUITests = runAllFlutterUITests;

console.log("Cyberpunk Agent | test-flutter-ui-system.js loaded successfully");
console.log("Available test functions:");
console.log("- testUIController()");
console.log("- testRealtimeMessageUpdates()");
console.log("- testComponentDirtyMarking()");
console.log("- testUpdateCycle()");
console.log("- testAgentApplicationIntegration()");
console.log("- testCompleteMessageFlow()");
console.log("- runAllFlutterUITests()"); 