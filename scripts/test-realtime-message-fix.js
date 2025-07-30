/**
 * Test script for real-time message fix
 * This script tests if messages from GM to players appear immediately in the chat interface
 */

console.log("Cyberpunk Agent | Testing real-time message fix...");

// Test function to simulate a message from GM to player
async function testRealtimeMessageFix() {
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("Cyberpunk Agent | Instance not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get user actors
  const userActors = agent.getUserActors();
  console.log("Cyberpunk Agent | User actors:", userActors.map(a => a.name));

  if (userActors.length < 2) {
    console.warn("Cyberpunk Agent | Need at least 2 actors to test");
    return;
  }

  const sender = userActors[0];
  const receiver = userActors[1];

  console.log(`Cyberpunk Agent | Testing message from ${sender.name} to ${receiver.name}`);

  // Test message data
  const testMessage = {
    id: `test-${Date.now()}`,
    senderId: sender.id,
    receiverId: receiver.id,
    text: `Test message at ${new Date().toLocaleTimeString()}`,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  // Test the handleMessageUpdate method directly
  console.log("Cyberpunk Agent | Testing handleMessageUpdate...");

  const testData = {
    userId: 'test-user',
    userName: 'Test User',
    timestamp: Date.now(),
    senderId: sender.id,
    receiverId: receiver.id,
    message: testMessage
  };

  // Call handleMessageUpdate
  agent.handleMessageUpdate(testData);

  // Check if message was added
  const messages = agent.getMessagesForConversation(sender.id, receiver.id);
  const messageExists = messages.some(msg => msg.id === testMessage.id);

  if (messageExists) {
    console.log("✅ Message was added successfully to conversation");
  } else {
    console.log("❌ Message was not added to conversation");
  }

  // Test SocketLib handleMessageUpdate if available
  if (window.socket && typeof window.socket.executeForEveryone === 'function') {
    console.log("Cyberpunk Agent | Testing SocketLib handleMessageUpdate...");

    try {
      await window.socket.executeForEveryone('messageUpdate', testData);
      console.log("✅ SocketLib messageUpdate executed successfully");
    } catch (error) {
      console.error("❌ SocketLib messageUpdate failed:", error);
    }
  } else {
    console.log("ℹ️ SocketLib not available for testing");
  }

  console.log("Cyberpunk Agent | Real-time message fix test completed");
}

// Export the test function
window.testRealtimeMessageFix = testRealtimeMessageFix;

// Auto-run test if in development mode
if (game.settings.get('cyberpunk-agent', 'debug-mode')) {
  console.log("Cyberpunk Agent | Auto-running real-time message fix test...");
  setTimeout(testRealtimeMessageFix, 2000);
}

console.log("Cyberpunk Agent | Real-time message fix test script loaded");
console.log("Cyberpunk Agent | Run 'testRealtimeMessageFix()' in console to test"); 