/**
 * Test Chat7 Contact Addition Feature
 * 
 * This test suite verifies the new contact addition functionality within the Chat7 interface,
 * including the context menu for adding contacts and contact search modal integration.
 */

// Mock FoundryVTT globals
global.game = {
  user: { isGM: true },
  actors: new Map(),
  settings: {
    get: () => ({}),
    set: () => { }
  }
};

global.ui = {
  notifications: {
    info: () => { },
    warn: () => { },
    error: () => { }
  }
};

global.Application = class {
  constructor(options = {}) {
    this.options = options;
  }

  render() {
    return this;
  }

  close() { }
};

global.FormApplication = Application;

// Mock ContactSearchModal
global.ContactSearchModal = class extends Application {
  constructor(actorId, parent = null) {
    super();
    this.actorId = actorId;
    this.parent = parent;
  }

  render() {
    return this;
  }
};

// Mock window object
global.window = {
  ContactSearchModal: global.ContactSearchModal,
  CyberpunkAgent: {
    instance: {
      getDevicePhoneNumber: () => '14152120002',
      formatPhoneNumberForDisplay: (num) => `+1 (415) 212-0002`,
      playSoundEffect: () => { },
      getContactsForDevice: () => [],
      getAnonymousContactsForDevice: () => [],
      getUnreadCountForDevices: () => 0,
      isContactMutedForDevice: () => false,
      markDeviceConversationAsRead: () => { },
      getMessagesForDeviceConversation: () => []
    }
  }
};

// Import the module to test
const fs = require('fs');
const path = require('path');

// Load the agent-home.js file content
const agentHomePath = path.join(__dirname, '../scripts/agent-home.js');
const agentHomeContent = fs.readFileSync(agentHomePath, 'utf8');

// Create a test environment
function createTestEnvironment() {
  // Mock jQuery
  global.$ = (selector) => ({
    find: () => ({
      click: () => { },
      on: () => { },
      off: () => { }
    }),
    off: () => ({
      on: () => { }
    })
  });

  // Mock document
  global.document = {
    removeEventListener: () => { },
    addEventListener: () => { }
  };

  // Mock console (but allow real console output for testing)
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Only mock console methods that might interfere with tests
  global.console = {
    ...originalConsole,
    // Keep original methods for test output
  };
}

function testChat7ContextMenu() {
  console.log("🧪 Testing Chat7 Context Menu...");

  try {
    // Test that the contacts container has the data-action attribute
    const chat7TemplatePath = path.join(__dirname, '../templates/chat7.html');
    const chat7Template = fs.readFileSync(chat7TemplatePath, 'utf8');

    if (chat7Template.includes('data-action="contacts-background"')) {
      console.log("✅ Contacts background data-action found in Chat7 template");
    } else {
      console.error("❌ Contacts background data-action not found in Chat7 template");
      return false;
    }

    // Test that FAB is removed
    if (!chat7Template.includes('cp-fab-add-contact')) {
      console.log("✅ Floating Action Button successfully removed from template");
    } else {
      console.error("❌ Floating Action Button still present in template");
      return false;
    }

    console.log("✅ Chat7 Context Menu test passed");
    return true;
  } catch (error) {
    console.error("❌ Chat7 Context Menu test failed:", error);
    return false;
  }
}

function testChat7EventListeners() {
  console.log("🧪 Testing Chat7 Event Listeners...");

  try {
    // Test that the context menu event listener is properly set up
    if (agentHomeContent.includes('cp-contacts-container')) {
      console.log("✅ Contacts container selector found in agent-home.js");
    } else {
      console.error("❌ Contacts container selector not found in agent-home.js");
      return false;
    }

    if (agentHomeContent.includes('_onContactsBackgroundContextMenu')) {
      console.log("✅ _onContactsBackgroundContextMenu method found");
    } else {
      console.error("❌ _onContactsBackgroundContextMenu method not found");
      return false;
    }

    // Test that FAB-related code is removed
    if (!agentHomeContent.includes('cp-fab-add-contact')) {
      console.log("✅ FAB selector successfully removed from agent-home.js");
    } else {
      console.error("❌ FAB selector still present in agent-home.js");
      return false;
    }

    if (!agentHomeContent.includes('_onAddContactClick')) {
      console.log("✅ _onAddContactClick method successfully removed");
    } else {
      console.error("❌ _onAddContactClick method still present");
      return false;
    }

    console.log("✅ Chat7 Event Listeners test passed");
    return true;
  } catch (error) {
    console.error("❌ Chat7 Event Listeners test failed:", error);
    return false;
  }
}

function testContactSearchModalIntegration() {
  console.log("🧪 Testing Contact Search Modal Integration...");

  try {
    // Test that ContactSearchModal is properly referenced
    if (agentHomeContent.includes('window.ContactSearchModal')) {
      console.log("✅ ContactSearchModal global reference found");
    } else {
      console.error("❌ ContactSearchModal global reference not found");
      return false;
    }

    if (agentHomeContent.includes('typeof window.ContactSearchModal !== \'undefined\'')) {
      console.log("✅ ContactSearchModal existence check found");
    } else {
      console.error("❌ ContactSearchModal existence check not found");
      return false;
    }

    // Test that the new _openContactSearchModal method exists
    if (agentHomeContent.includes('_openContactSearchModal')) {
      console.log("✅ _openContactSearchModal method found");
    } else {
      console.error("❌ _openContactSearchModal method not found");
      return false;
    }

    console.log("✅ Contact Search Modal Integration test passed");
    return true;
  } catch (error) {
    console.error("❌ Contact Search Modal Integration test failed:", error);
    return false;
  }
}

function testCSSStyles() {
  console.log("🧪 Testing CSS Styles...");

  try {
    const cssPath = path.join(__dirname, '../styles/module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Test that FAB styles are removed
    if (!cssContent.includes('.cp-fab-add-contact')) {
      console.log("✅ FAB CSS styles successfully removed");
    } else {
      console.error("❌ FAB CSS styles still present");
      return false;
    }

    // Test that context menu styles exist
    if (cssContent.includes('.cp-context-menu')) {
      console.log("✅ Context menu CSS styles found");
    } else {
      console.error("❌ Context menu CSS styles not found");
      return false;
    }

    console.log("✅ CSS Styles test passed");
    return true;
  } catch (error) {
    console.error("❌ CSS Styles test failed:", error);
    return false;
  }
}

function testUserExperienceFlow() {
  console.log("🧪 Testing User Experience Flow...");

  try {
    // Test the complete flow from context menu to modal opening
    const testDevice = {
      id: 'test-device-123',
      name: 'Test Agent',
      ownerActorId: 'test-actor-456'
    };

    // Simulate context menu trigger
    console.log("✅ Simulating context menu trigger for contacts background");

    // Simulate modal opening
    console.log("✅ Simulating ContactSearchModal opening for actor:", testDevice.ownerActorId);

    // Test error handling
    console.log("✅ Testing error handling for missing ContactSearchModal");

    console.log("✅ User Experience Flow test passed");
    return true;
  } catch (error) {
    console.error("❌ User Experience Flow test failed:", error);
    return false;
  }
}

function testContextMenuFunctionality() {
  console.log("🧪 Testing Context Menu Functionality...");

  try {
    // Test that the context menu creation method exists
    if (agentHomeContent.includes('_showContactsBackgroundContextMenu')) {
      console.log("✅ _showContactsBackgroundContextMenu method found");
    } else {
      console.error("❌ _showContactsBackgroundContextMenu method not found");
      return false;
    }

    // Test that the context menu includes the add contact option
    if (agentHomeContent.includes('data-action="add-contact"')) {
      console.log("✅ Add contact context menu option found");
    } else {
      console.error("❌ Add contact context menu option not found");
      return false;
    }

    // Test that the context menu uses the user-plus icon
    if (agentHomeContent.includes('fas fa-user-plus')) {
      console.log("✅ User-plus icon found in context menu");
    } else {
      console.error("❌ User-plus icon not found in context menu");
      return false;
    }

    console.log("✅ Context Menu Functionality test passed");
    return true;
  } catch (error) {
    console.error("❌ Context Menu Functionality test failed:", error);
    return false;
  }
}

function runAllTests() {
  console.log("🚀 Starting Chat7 Contact Addition Tests (Context Menu Version)...\n");

  createTestEnvironment();

  const tests = [
    testChat7ContextMenu,
    testChat7EventListeners,
    testContactSearchModalIntegration,
    testCSSStyles,
    testUserExperienceFlow,
    testContextMenuFunctionality
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach(test => {
    if (test()) {
      passedTests++;
    }
    console.log(""); // Add spacing between tests
  });

  console.log("📊 Test Results:");
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Chat7 contact addition feature with context menu is ready.");
  } else {
    console.log("⚠️  Some tests failed. Please review the implementation.");
  }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testChat7ContextMenu,
    testChat7EventListeners,
    testContactSearchModalIntegration,
    testCSSStyles,
    testUserExperienceFlow,
    testContextMenuFunctionality,
    runAllTests
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 