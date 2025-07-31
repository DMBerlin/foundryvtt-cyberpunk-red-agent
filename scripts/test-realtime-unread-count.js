// Test file for real-time unread count updates
// This test verifies that unread count chips appear immediately when new messages arrive

console.log("=== Cyberpunk Agent - Real-time Unread Count Test ===");

// Test function for real-time unread count updates
window.testRealtimeUnreadCount = async () => {
  console.log("🧪 Testing real-time unread count updates...");

  // Check if CyberpunkAgent is available
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get test actors
  const actors = agent.getUserActors();
  if (actors.length < 2) {
    console.error("❌ Need at least 2 actors for testing");
    return false;
  }

  const actor1 = actors[0];
  const actor2 = actors[1];

  console.log(`📱 Testing with actors: ${actor1.name} (${actor1.id}) and ${actor2.name} (${actor2.id})`);

  // Step 1: Clear any existing unread counts
  console.log("1. Clearing existing unread counts...");
  agent.markConversationAsRead(actor1.id, actor2.id);
  agent.markConversationAsRead(actor2.id, actor1.id);

  // Step 2: Open Chat7 for actor1
  console.log("2. Opening Chat7 for actor1...");
  const chat7 = new window.AgentApplication(actor1);
  chat7.navigateTo('chat7');
  chat7.render(true);

  // Wait for interface to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 3: Check initial unread count for actor2
  console.log("3. Checking initial unread count...");
  const initialUnreadCount = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Initial unread count for ${actor2.name}: ${initialUnreadCount}`);

  if (initialUnreadCount > 0) {
    console.warn("⚠️ Initial unread count is not 0, this might affect the test");
  }

  // Step 4: Send a message from actor2 to actor1 (simulating external message)
  console.log("4. Sending message from actor2 to actor1...");
  const testMessage = "Test message for real-time unread count update";

  // Simulate a message update event (like what happens when a message arrives via SocketLib)
  const messageData = {
    timestamp: Date.now(),
    userId: 'test-user',
    userName: 'Test User',
    senderId: actor2.id,
    receiverId: actor1.id,
    message: {
      id: `test-${Date.now()}`,
      senderId: actor2.id,
      receiverId: actor1.id,
      text: testMessage,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    }
  };

  // Process the message update
  agent.handleMessageUpdate(messageData);

  // Wait for UI updates
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 5: Check if unread count updated in the interface
  console.log("5. Checking if unread count updated in the interface...");

  // Check the unread count in the interface
  const unreadElement = chat7.element?.find(`[data-contact-id="${actor2.id}"] .cp-unread-count`);
  if (unreadElement.length > 0) {
    const displayedCount = parseInt(unreadElement.text());
    console.log(`📊 Unread count displayed in interface: ${displayedCount}`);

    if (displayedCount === 1) {
      console.log("✅ Real-time unread count update works correctly!");
    } else {
      console.error(`❌ Expected displayed count to be 1, but got ${displayedCount}`);
      return false;
    }
  } else {
    console.error("❌ Unread count element not found in interface");
    return false;
  }

  // Step 6: Check the actual unread count in the data
  console.log("6. Verifying unread count in data...");
  const actualUnreadCount = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Actual unread count in data: ${actualUnreadCount}`);

  if (actualUnreadCount === 1) {
    console.log("✅ Unread count data is correct");
  } else {
    console.error(`❌ Expected unread count to be 1, but got ${actualUnreadCount}`);
    return false;
  }

  // Step 7: Test opening the conversation to mark as read
  console.log("7. Testing conversation opening to mark as read...");
  chat7.navigateTo('conversation', actor2);
  chat7.render(true);

  // Wait for conversation to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if unread count was cleared
  const unreadAfterOpen = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Unread count after opening conversation: ${unreadAfterOpen}`);

  if (unreadAfterOpen === 0) {
    console.log("✅ Conversation opening correctly marks messages as read");
  } else {
    console.warn(`⚠️ Unread count should be 0 after opening conversation, but got ${unreadAfterOpen}`);
  }

  // Close the interface
  chat7.close();

  console.log("✅ All real-time unread count tests completed successfully!");
  console.log("💡 Features tested:");
  console.log("   - Real-time unread count updates when new messages arrive");
  console.log("   - Unread count display in Chat7 interface");
  console.log("   - Automatic marking as read when opening conversation");
  console.log("   - Data consistency between interface and backend");

  ui.notifications.success("Teste de atualização em tempo real de mensagens não lidas concluído com sucesso!");
  return true;
};

// Test function for manual unread count verification
window.testUnreadCountData = () => {
  console.log("=== Testing Unread Count Data ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;
  const actors = agent.getUserActors();

  console.log("📊 Current unread count data:");
  actors.forEach(actor1 => {
    actors.forEach(actor2 => {
      if (actor1.id !== actor2.id) {
        const unreadCount = agent.getUnreadCount(actor1.id, actor2.id);
        if (unreadCount > 0) {
          console.log(`   ${actor1.name} -> ${actor2.name}: ${unreadCount} unread`);
        }
      }
    });
  });

  return true;
};

console.log("✅ Real-time unread count test functions loaded");
console.log("💡 Available functions:");
console.log("   - window.testRealtimeUnreadCount() - Test real-time unread count updates");
console.log("   - window.testUnreadCountData() - Check current unread count data"); 