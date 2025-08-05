/**
 * Test script to debug the agent menu popup issue
 * Run this in the browser console to test the agent menu functionality
 */

class TestAgentMenuDebug {
  constructor() {
    this.cyberpunkAgent = game.modules.get('cyberpunk-agent').api;
  }

  /**
   * Test the getEquippedAgentsForUser function
   */
  testGetEquippedAgentsForUser() {
    console.log("=== Testing getEquippedAgentsForUser ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    const equippedAgents = this.cyberpunkAgent.getEquippedAgentsForUser();
    console.log("Equipped agents result:", equippedAgents);
    console.log("Equipped agents length:", equippedAgents.length);

    if (equippedAgents.length > 0) {
      console.log("First equipped agent structure:", equippedAgents[0]);
    }

    return equippedAgents;
  }

  /**
   * Test the showEquippedAgentMenu function with mock data
   */
  async testShowEquippedAgentMenu() {
    console.log("=== Testing showEquippedAgentMenu with mock data ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    // Create mock equipped agents data
    const mockEquippedAgents = [
      {
        deviceId: "device-test1-123",
        actorId: "test1",
        actorName: "Test Character 1",
        itemId: "123",
        itemName: "Agent Device 1"
      },
      {
        deviceId: "device-test2-456",
        actorId: "test2",
        actorName: "Test Character 2",
        itemId: "456",
        itemName: "Agent Device 2"
      }
    ];

    console.log("Mock equipped agents:", mockEquippedAgents);

    try {
      await this.cyberpunkAgent.showEquippedAgentMenu(mockEquippedAgents);
    } catch (error) {
      console.error("Error testing showEquippedAgentMenu:", error);
    }
  }

  /**
   * Test the openAgentInterface function
   */
  async testOpenAgentInterface() {
    console.log("=== Testing openAgentInterface ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    try {
      await this.cyberpunkAgent.openAgentInterface();
    } catch (error) {
      console.error("Error testing openAgentInterface:", error);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("=== Starting Agent Menu Debug Tests ===");

    // Test 1: Check equipped agents
    const equippedAgents = this.testGetEquippedAgentsForUser();

    // Test 2: Test menu with mock data
    await this.testShowEquippedAgentMenu();

    // Test 3: Test actual interface (only if we have equipped agents)
    if (equippedAgents && equippedAgents.length > 0) {
      console.log("Found equipped agents, testing actual interface...");
      await this.testOpenAgentInterface();
    } else {
      console.log("No equipped agents found, skipping actual interface test");
    }

    console.log("=== Agent Menu Debug Tests Complete ===");
  }

  /**
   * Quick test to check if the module is working
   */
  quickTest() {
    console.log("=== Quick Agent Module Test ===");

    if (!this.cyberpunkAgent) {
      console.error("❌ Cyberpunk Agent module not found!");
      return false;
    }

    console.log("✅ Cyberpunk Agent module found");
    console.log("Module API:", this.cyberpunkAgent);

    // Check if key functions exist
    const requiredFunctions = [
      'getEquippedAgentsForUser',
      'showEquippedAgentMenu',
      'openAgentInterface',
      'getUserActors'
    ];

    requiredFunctions.forEach(funcName => {
      if (typeof this.cyberpunkAgent[funcName] === 'function') {
        console.log(`✅ ${funcName} function exists`);
      } else {
        console.log(`❌ ${funcName} function missing`);
      }
    });

    return true;
  }
}

// Create global instance for easy access
window.testAgentMenuDebug = new TestAgentMenuDebug();

// Auto-run quick test
console.log("Agent Menu Debug Test Script Loaded");
window.testAgentMenuDebug.quickTest();

// Usage instructions
console.log(`
=== Usage Instructions ===
To test the agent menu functionality, run these commands in the console:

1. Quick test: testAgentMenuDebug.quickTest()
2. Test equipped agents: testAgentMenuDebug.testGetEquippedAgentsForUser()
3. Test menu with mock data: testAgentMenuDebug.testShowEquippedAgentMenu()
4. Test actual interface: testAgentMenuDebug.testOpenAgentInterface()
5. Run all tests: testAgentMenuDebug.runAllTests()
`); 