/**
 * Test Script: Single Instance Navigation
 * Verifies that the Agent uses a single instance for all navigation
 */

console.log("Cyberpunk Agent | Running single instance navigation test...");

// Test function to verify single instance behavior
async function testSingleInstanceNavigation() {
  console.log("=== Single Instance Navigation Test ===");

  try {
    // Get user actors
    const userActors = window.CyberpunkAgent?.instance?.getUserActors() || [];
    if (userActors.length === 0) {
      console.error("❌ No user actors found for testing");
      return false;
    }

    const testActor = userActors[0];
    console.log(`✅ Using actor for testing: ${testActor.name}`);

    // Check if AgentApplication is available
    if (typeof AgentApplication === 'undefined' && typeof window.AgentApplication === 'undefined') {
      console.error("❌ AgentApplication not available");
      return false;
    }
    console.log("✅ AgentApplication is available");

    // Create AgentApplication instance
    const AgentClass = AgentApplication || window.AgentApplication;
    const agentApp = new AgentClass(testActor);
    console.log("✅ AgentApplication instance created");

    // Test initial state
    console.log(`✅ Initial view: ${agentApp.currentView}`);
    console.log(`✅ Initial contact: ${agentApp.currentContact}`);

    // Test navigation to Chat7
    console.log("🔄 Testing navigation to Chat7...");
    agentApp.navigateTo('chat7');
    console.log(`✅ View after Chat7 navigation: ${agentApp.currentView}`);

    // Test navigation to conversation (with mock contact)
    const mockContact = {
      id: 'test-contact-1',
      name: 'Test Contact',
      phoneNumber: '555-0123',
      isAnonymous: false
    };

    console.log("🔄 Testing navigation to conversation...");
    agentApp.navigateTo('conversation', mockContact);
    console.log(`✅ View after conversation navigation: ${agentApp.currentView}`);
    console.log(`✅ Contact after conversation navigation: ${agentApp.currentContact?.name}`);

    // Test navigation back to Chat7
    console.log("🔄 Testing navigation back to Chat7...");
    agentApp.navigateTo('chat7');
    console.log(`✅ View after back navigation: ${agentApp.currentView}`);

    // Test navigation back to home
    console.log("🔄 Testing navigation back to home...");
    agentApp.navigateTo('home');
    console.log(`✅ View after home navigation: ${agentApp.currentView}`);

    // Test template switching
    console.log("🔄 Testing template switching...");
    const originalTemplate = agentApp.options.template;

    agentApp.navigateTo('chat7');
    console.log(`✅ Chat7 template: ${agentApp.options.template}`);

    agentApp.navigateTo('conversation', mockContact);
    console.log(`✅ Conversation template: ${agentApp.options.template}`);

    agentApp.navigateTo('home');
    console.log(`✅ Home template: ${agentApp.options.template}`);

    // Verify template paths are correct
    const expectedTemplates = {
      'home': 'modules/cyberpunk-agent/templates/agent-home.html',
      'chat7': 'modules/cyberpunk-agent/templates/chat7.html',
      'conversation': 'modules/cyberpunk-agent/templates/chat-conversation.html'
    };

    let templateTestPassed = true;
    Object.entries(expectedTemplates).forEach(([view, expectedTemplate]) => {
      agentApp.navigateTo(view, view === 'conversation' ? mockContact : null);
      if (agentApp.options.template !== expectedTemplate) {
        console.error(`❌ Template mismatch for ${view}: expected ${expectedTemplate}, got ${agentApp.options.template}`);
        templateTestPassed = false;
      } else {
        console.log(`✅ Template correct for ${view}: ${agentApp.options.template}`);
      }
    });

    if (!templateTestPassed) {
      console.error("❌ Template switching test failed");
      return false;
    }

    // Test view rendering methods exist
    console.log("🔄 Testing view rendering methods...");
    if (typeof agentApp._renderHomeView === 'function') {
      console.log("✅ _renderHomeView method exists");
    } else {
      console.error("❌ _renderHomeView method missing");
      return false;
    }

    if (typeof agentApp._renderChat7View === 'function') {
      console.log("✅ _renderChat7View method exists");
    } else {
      console.error("❌ _renderChat7View method missing");
      return false;
    }

    if (typeof agentApp._renderConversationView === 'function') {
      console.log("✅ _renderConversationView method exists");
    } else {
      console.error("❌ _renderConversationView method missing");
      return false;
    }

    // Test real-time listener setup methods
    console.log("🔄 Testing real-time listener methods...");
    if (typeof agentApp._setupChat7RealtimeListener === 'function') {
      console.log("✅ _setupChat7RealtimeListener method exists");
    } else {
      console.error("❌ _setupChat7RealtimeListener method missing");
      return false;
    }

    if (typeof agentApp._setupConversationRealtimeListener === 'function') {
      console.log("✅ _setupConversationRealtimeListener method exists");
    } else {
      console.error("❌ _setupConversationRealtimeListener method missing");
      return false;
    }

    // Test event handler methods
    console.log("🔄 Testing event handler methods...");
    const requiredHandlers = [
      '_onChat7Click',
      '_onBackClick',
      '_onContactChatClick',
      '_onContactContextMenu',
      '_onSendMessage',
      '_onMessageInputKeypress'
    ];

    let handlersTestPassed = true;
    requiredHandlers.forEach(handler => {
      if (typeof agentApp[handler] === 'function') {
        console.log(`✅ ${handler} method exists`);
      } else {
        console.error(`❌ ${handler} method missing`);
        handlersTestPassed = false;
      }
    });

    if (!handlersTestPassed) {
      console.error("❌ Event handler methods test failed");
      return false;
    }

    // Test legacy class compatibility
    console.log("🔄 Testing legacy class compatibility...");
    if (typeof AgentHomeApplication !== 'undefined') {
      console.log("✅ AgentHomeApplication legacy class exists");
      const legacyHome = new AgentHomeApplication(testActor);
      console.log(`✅ Legacy home view: ${legacyHome.currentView}`);
    } else {
      console.error("❌ AgentHomeApplication legacy class missing");
      return false;
    }

    if (typeof Chat7Application !== 'undefined') {
      console.log("✅ Chat7Application legacy class exists");
      const legacyChat7 = new Chat7Application(testActor);
      console.log(`✅ Legacy Chat7 view: ${legacyChat7.currentView}`);
    } else {
      console.error("❌ Chat7Application legacy class missing");
      return false;
    }

    if (typeof ChatConversationApplication !== 'undefined') {
      console.log("✅ ChatConversationApplication legacy class exists");
      const legacyConversation = new ChatConversationApplication(testActor, mockContact);
      console.log(`✅ Legacy conversation view: ${legacyConversation.currentView}`);
      console.log(`✅ Legacy conversation contact: ${legacyConversation.currentContact?.name}`);
    } else {
      console.error("❌ ChatConversationApplication legacy class missing");
      return false;
    }

    console.log("✅ All single instance navigation tests passed!");
    return true;

  } catch (error) {
    console.error("❌ Single instance navigation test failed:", error);
    return false;
  }
}

// Test function to verify no new popups are created
async function testNoNewPopups() {
  console.log("=== No New Popups Test ===");

  try {
    // Get user actors
    const userActors = window.CyberpunkAgent?.instance?.getUserActors() || [];
    if (userActors.length === 0) {
      console.error("❌ No user actors found for testing");
      return false;
    }

    const testActor = userActors[0];

    // Check current open applications
    const initialOpenApps = ui.windows.filter(app => app.id === 'cyberpunk-agent').length;
    console.log(`✅ Initial open Agent applications: ${initialOpenApps}`);

    // Create AgentApplication instance
    const AgentClass = AgentApplication || window.AgentApplication;
    const agentApp = new AgentClass(testActor);

    // Render the application
    agentApp.render(true);

    // Check applications after render
    const afterRenderApps = ui.windows.filter(app => app.id === 'cyberpunk-agent').length;
    console.log(`✅ Agent applications after render: ${afterRenderApps}`);

    if (afterRenderApps > initialOpenApps + 1) {
      console.error("❌ Multiple Agent applications created - popup issue detected");
      return false;
    }

    // Test navigation without creating new instances
    console.log("🔄 Testing navigation without new instances...");

    // Navigate to Chat7
    agentApp.navigateTo('chat7');
    const afterChat7Apps = ui.windows.filter(app => app.id === 'cyberpunk-agent').length;
    console.log(`✅ Agent applications after Chat7 navigation: ${afterChat7Apps}`);

    if (afterChat7Apps > afterRenderApps) {
      console.error("❌ New Agent application created during Chat7 navigation");
      return false;
    }

    // Navigate to conversation
    const mockContact = {
      id: 'test-contact-1',
      name: 'Test Contact',
      phoneNumber: '555-0123',
      isAnonymous: false
    };

    agentApp.navigateTo('conversation', mockContact);
    const afterConversationApps = ui.windows.filter(app => app.id === 'cyberpunk-agent').length;
    console.log(`✅ Agent applications after conversation navigation: ${afterConversationApps}`);

    if (afterConversationApps > afterRenderApps) {
      console.error("❌ New Agent application created during conversation navigation");
      return false;
    }

    // Navigate back to home
    agentApp.navigateTo('home');
    const afterHomeApps = ui.windows.filter(app => app.id === 'cyberpunk-agent').length;
    console.log(`✅ Agent applications after home navigation: ${afterHomeApps}`);

    if (afterHomeApps > afterRenderApps) {
      console.error("❌ New Agent application created during home navigation");
      return false;
    }

    console.log("✅ No new popups test passed!");
    return true;

  } catch (error) {
    console.error("❌ No new popups test failed:", error);
    return false;
  }
}

// Run all tests
async function runAllSingleInstanceTests() {
  console.log("🚀 Starting single instance navigation tests...");

  const test1 = await testSingleInstanceNavigation();
  const test2 = await testNoNewPopups();

  if (test1 && test2) {
    console.log("🎉 All single instance navigation tests passed!");
    ui.notifications.info("Single instance navigation test: PASSED");
  } else {
    console.error("💥 Some single instance navigation tests failed!");
    ui.notifications.error("Single instance navigation test: FAILED");
  }
}

// Export for manual testing
window.testSingleInstanceNavigation = testSingleInstanceNavigation;
window.testNoNewPopups = testNoNewPopups;
window.runAllSingleInstanceTests = runAllSingleInstanceTests;

// Auto-run if this script is executed directly
if (typeof module === 'undefined') {
  // Running in browser context
  runAllSingleInstanceTests();
} 