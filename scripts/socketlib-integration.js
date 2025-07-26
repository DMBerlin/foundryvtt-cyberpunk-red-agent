/**
 * SocketLib Integration for Cyberpunk Agent
 * Provides robust real-time communication between clients
 * Following official SocketLib documentation and Sequencer patterns
 */

console.log("Cyberpunk Agent | Loading SocketLib integration...");

let socket;

// Hook for when SocketLib is ready - THIS IS MANDATORY according to documentation
Hooks.once("socketlib.ready", () => {
  console.log("Cyberpunk Agent | SocketLib ready, registering module...");

  try {
    // Register our module with SocketLib - THIS IS THE CORRECT WAY
    socket = socketlib.registerModule("cyberpunk-agent");

    // Register our functions that can be called remotely
    socket.register("contactUpdate", handleContactUpdate);
    socket.register("ping", handlePing);
    socket.register("testConnection", handleTestConnection);
    socket.register("broadcastUpdate", handleBroadcastUpdate);

    console.log("Cyberpunk Agent | SocketLib module registered successfully");

    // Test the setup
    testSocketLibSetup();

  } catch (error) {
    console.error("Cyberpunk Agent | Error registering module with SocketLib:", error);
  }
});

/**
 * Test SocketLib setup
 */
function testSocketLibSetup() {
  try {
    // Check if module is registered
    const modules = socketlib.modules || [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`Cyberpunk Agent | Module registered with SocketLib: ${isRegistered}`);

    // Check connection status
    const isConnected = socketlib.isConnected();
    console.log(`Cyberpunk Agent | SocketLib connected: ${isConnected}`);

    if (!isRegistered) {
      console.warn("Cyberpunk Agent | Module not properly registered with SocketLib");
    }

    if (!isConnected) {
      console.warn("Cyberpunk Agent | SocketLib not connected");
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error testing SocketLib setup:", error);
  }
}

/**
 * Handle contact update from other clients
 */
async function handleContactUpdate(data) {
  console.log("Cyberpunk Agent | Received contact update via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own update notification");
    return;
  }

  // Check if this is a recent update to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore updates older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old update notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing contact update from:", data.userName);

  // Reload contact data from settings
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("Cyberpunk Agent | Reloading agent data...");
    window.CyberpunkAgent.instance.loadAgentData();
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for data reload");
  }

  // Update all open interfaces
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("Cyberpunk Agent | Updating open interfaces...");
    window.CyberpunkAgent.instance.updateOpenInterfaces();
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for interface update");
  }

  // Show notification to user
  const message = data.userName === game.user.name
    ? "Sua lista de contatos foi atualizada!"
    : `Lista de contatos atualizada por ${data.userName}!`;

  ui.notifications.info(message);

  console.log("Cyberpunk Agent | Contact update processed via SocketLib successfully");
}

/**
 * Handle broadcast update from other clients
 */
async function handleBroadcastUpdate(data) {
  console.log("Cyberpunk Agent | Received broadcast update via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own broadcast notification");
    return;
  }

  // Process the update
  await handleContactUpdate(data);
}

/**
 * Handle ping from other clients
 */
async function handlePing(data) {
  console.log("Cyberpunk Agent | Received ping via SocketLib, sending pong");

  try {
    await socket.executeAsGM('pong', {
      timestamp: data.timestamp,
      userId: game.user.id,
      userName: game.user.name
    });
  } catch (error) {
    console.error("Cyberpunk Agent | Error sending pong:", error);
  }
}

/**
 * Handle test connection
 */
async function handleTestConnection(data) {
  console.log("Cyberpunk Agent | Received test connection via SocketLib");

  return {
    success: true,
    timestamp: Date.now(),
    userId: game.user.id,
    userName: game.user.name,
    originalData: data
  };
}

class SocketLibIntegration {
  constructor() {
    this.socketlib = socket;
    this.isAvailable = !!socket;
    console.log("Cyberpunk Agent | SocketLib integration initialized, available:", this.isAvailable);
  }

  /**
   * Send contact update to all clients
   */
  async sendContactUpdate(data) {
    if (!this.isAvailable || !socket) {
      console.warn("Cyberpunk Agent | SocketLib not available, using fallback");
      return false;
    }

    try {
      const updateData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      console.log("Cyberpunk Agent | Attempting to send contact update via SocketLib:", updateData);

      // Check if SocketLib is connected
      if (!socketlib.isConnected()) {
        console.warn("Cyberpunk Agent | SocketLib not connected, cannot send update");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('contactUpdate', updateData);

      console.log("Cyberpunk Agent | Contact update sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending contact update via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket,
        isConnected: socketlib ? socketlib.isConnected() : false
      });
      return false;
    }
  }

  /**
   * Send contact update to specific user
   */
  async sendContactUpdateToUser(userId, data) {
    if (!this.isAvailable || !socket) return false;

    try {
      const updateData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      // Send to specific user
      await socket.executeAsUser('contactUpdate', userId, updateData);

      console.log(`Cyberpunk Agent | Contact update sent to user ${userId} via SocketLib`);
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending contact update to user via SocketLib:", error);
      return false;
    }
  }

  /**
   * Broadcast to all clients
   */
  async broadcastToAll(eventName, data) {
    if (!this.isAvailable || !socket) return false;

    try {
      await socket.executeForEveryone(eventName, data);
      console.log(`Cyberpunk Agent | Broadcast '${eventName}' sent via SocketLib to all clients`);
      return true;
    } catch (error) {
      console.error(`Cyberpunk Agent | Error broadcasting '${eventName}' via SocketLib:`, error);
      return false;
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    if (!this.isAvailable || !socket) return false;

    try {
      const testData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name
      };

      const result = await socket.executeAsGM('testConnection', testData);
      console.log("Cyberpunk Agent | SocketLib connection test result:", result);
      return result;
    } catch (error) {
      console.error("Cyberpunk Agent | SocketLib connection test failed:", error);
      return false;
    }
  }

  /**
   * Test broadcast to all clients
   */
  async testBroadcast() {
    if (!this.isAvailable || !socket) return false;

    try {
      const testData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        test: true
      };

      console.log("Cyberpunk Agent | Testing SocketLib broadcast...");
      await socket.executeForEveryone('contactUpdate', testData);
      console.log("Cyberpunk Agent | SocketLib broadcast test sent successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | SocketLib broadcast test failed:", error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    if (!this.isAvailable || !socket) {
      return {
        available: false,
        method: 'none',
        connected: false
      };
    }

    return {
      available: true,
      method: 'socketlib',
      connected: socketlib.isConnected(),
      users: game.users.size
    };
  }

  /**
   * Get detailed status information
   */
  getDetailedStatus() {
    const status = this.getConnectionStatus();

    if (!status.available) {
      return {
        ...status,
        recommendation: 'Use native socket or chat fallback',
        features: []
      };
    }

    return {
      ...status,
      recommendation: 'SocketLib is optimal for real-time communication',
      features: [
        'Reliable WebSocket communication',
        'Automatic reconnection',
        'GM-to-client messaging',
        'Client-to-client messaging',
        'Broadcast capabilities',
        'Connection testing'
      ]
    };
  }
}

// Create global instance
window.SocketLibIntegration = SocketLibIntegration;

// Test functions
window.testSocketLib = async () => {
  console.log("=== SocketLib Test ===");

  if (!window.socketlib) {
    console.error("❌ SocketLib not available");
    return false;
  }

  console.log("✅ SocketLib found");

  const integration = new SocketLibIntegration();

  if (!integration.isAvailable) {
    console.error("❌ SocketLib integration failed");
    return false;
  }

  console.log("✅ SocketLib integration successful");

  // Test connection
  const connectionTest = await integration.testConnection();
  console.log("Connection test:", connectionTest);

  // Test broadcast
  const broadcastTest = await integration.testBroadcast();
  console.log("Broadcast test:", broadcastTest);

  // Get status
  const status = integration.getDetailedStatus();
  console.log("Status:", status);

  return true;
};

window.testSocketLibBroadcast = async () => {
  console.log("=== SocketLib Broadcast Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  if (!agent._isSocketLibAvailable()) {
    console.error("❌ SocketLib not available in CyberpunkAgent");
    return false;
  }

  console.log("✅ SocketLib available in CyberpunkAgent");

  // Test broadcast
  const result = await agent.socketLibIntegration.testBroadcast();

  if (result) {
    console.log("✅ SocketLib broadcast test successful");
    console.log("💡 Check other clients to see if they received the notification");
  } else {
    console.log("❌ SocketLib broadcast test failed");
  }

  return result;
};

window.getSocketLibStatus = () => {
  if (!window.SocketLibIntegration) {
    return { available: false, error: 'SocketLib integration not loaded' };
  }

  const integration = new SocketLibIntegration();
  return integration.getDetailedStatus();
};

console.log("Cyberpunk Agent | SocketLib integration loaded");
console.log("Run 'testSocketLib()' to test SocketLib functionality");
console.log("Run 'testSocketLibBroadcast()' to test broadcast to all clients");
console.log("Run 'getSocketLibStatus()' to check SocketLib status"); 