/**
 * Test script for GM Agent Improvements
 * 
 * This script tests the improved GM agent functionality that:
 * 1. Shows only equipped agents from actors the GM has ownership over
 * 2. Displays proper actor names instead of "Unknown"
 * 3. Works consistently for both GM and players
 */

class TestGMAgentImprovements {
  constructor() {
    this.agent = CyberpunkAgent.instance;
    if (!this.agent) {
      console.error("❌ CyberpunkAgent instance not found!");
      return;
    }
  }

  async runTests() {
    console.log("🧪 Testing GM Agent Improvements...");
    console.log("=====================================");

    // Test 1: Check equipped agents for current user
    await this.testEquippedAgentsForUser();

    // Test 2: Check user actors
    await this.testUserActors();

    // Test 3: Check device filtering
    await this.testDeviceFiltering();

    // Test 4: Check token controls logic
    await this.testTokenControlsLogic();

    console.log("✅ GM Agent Improvements tests completed!");
  }

  async testEquippedAgentsForUser() {
    console.log("\n📱 Test 1: Equipped Agents for User");
    console.log("-----------------------------------");

    const equippedAgents = this.agent.getEquippedAgentsForUser();
    console.log(`Found ${equippedAgents.length} equipped agents for current user`);

    equippedAgents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.actorName} - ${agent.itemName} (${agent.deviceId})`);
    });

    if (equippedAgents.length === 0) {
      console.log("⚠️  No equipped agents found. This is normal if no agents are equipped.");
    }
  }

  async testUserActors() {
    console.log("\n👥 Test 2: User Actors");
    console.log("----------------------");

    const userActors = this.agent.getUserActors();
    console.log(`Found ${userActors.length} actors for current user`);

    userActors.forEach((actor, index) => {
      console.log(`  ${index + 1}. ${actor.name} (${actor.id}) - Type: ${actor.type}`);

      // Check ownership
      if (actor.ownership && game.user.id) {
        const ownership = actor.ownership[game.user.id];
        console.log(`     Ownership: ${ownership}`);
      }
    });
  }

  async testDeviceFiltering() {
    console.log("\n🔍 Test 3: Device Filtering");
    console.log("---------------------------");

    // Check if devices exist
    if (!this.agent.devices || this.agent.devices.size === 0) {
      console.log("⚠️  No devices found in the system");
      return;
    }

    console.log(`Total devices in system: ${this.agent.devices.size}`);

    // Get equipped agents
    const equippedAgents = this.agent.getEquippedAgentsForUser();
    console.log(`Equipped agents: ${equippedAgents.length}`);

    // Check if equipped agents correspond to actual devices
    equippedAgents.forEach(agent => {
      const device = this.agent.devices.get(agent.deviceId);
      if (device) {
        console.log(`✅ Device found for ${agent.actorName}: ${device.deviceName || 'Unnamed Device'}`);
      } else {
        console.log(`❌ Device NOT found for ${agent.actorName}: ${agent.deviceId}`);
      }
    });
  }

  async testTokenControlsLogic() {
    console.log("\n🎮 Test 4: Token Controls Logic");
    console.log("-------------------------------");

    // Simulate the token controls logic
    const equippedAgents = this.agent.getEquippedAgentsForUser();

    if (equippedAgents.length === 0) {
      console.log("ℹ️  No equipped agents - button should not appear");
    } else if (equippedAgents.length === 1) {
      console.log("ℹ️  One equipped agent - button should open directly");
      console.log(`   Agent: ${equippedAgents[0].actorName} - ${equippedAgents[0].itemName}`);
    } else {
      console.log("ℹ️  Multiple equipped agents - button should show selection menu");
      equippedAgents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.actorName} - ${agent.itemName}`);
      });
    }

    // Test the interface opening logic
    console.log("\n🔧 Testing interface opening logic...");
    try {
      await this.agent.openAgentInterface();
      console.log("✅ Interface opened successfully");
    } catch (error) {
      console.log("⚠️  Interface opening failed (this might be expected if no agents are equipped):", error.message);
    }
  }

  // Helper method to display current user info
  displayUserInfo() {
    console.log("\n👤 Current User Information");
    console.log("---------------------------");
    console.log(`User: ${game.user ? game.user.name : 'Unknown'}`);
    console.log(`User ID: ${game.user ? game.user.id : 'Unknown'}`);
    console.log(`Is GM: ${game.user ? game.user.isGM : 'Unknown'}`);
    console.log(`Active Scene: ${game.scenes?.active ? game.scenes.active.name : 'None'}`);
  }
}

// Auto-run the tests when the script is loaded
if (typeof CyberpunkAgent !== 'undefined' && CyberpunkAgent.instance) {
  const tester = new TestGMAgentImprovements();
  tester.displayUserInfo();
  tester.runTests();
} else {
  console.error("❌ CyberpunkAgent not available. Make sure the module is loaded.");
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestGMAgentImprovements;
} 