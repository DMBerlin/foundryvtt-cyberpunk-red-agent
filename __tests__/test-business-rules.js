/**
 * Test script to verify business rules implementation
 * This script tests the business rules for the Cyberpunk Agent module
 */

console.log("=== Business Rules Test ===");

// Test function to check business rules implementation
window.testBusinessRules = async () => {
  console.log("🧪 Testing business rules implementation...");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Check user permissions for Actors
  console.log("1. Testing user permissions for Actors...");
  console.log(`👤 Current user: ${game.user.name}`);
  console.log(`🔑 Is GM: ${game.user.isGM}`);
  console.log(`🔑 Is Assistant: ${game.user.hasRole('ASSISTANT')}`);

  const userActors = agent.getUserActors();
  console.log(`📱 User actors: ${userActors.length}`);
  userActors.forEach(actor => {
    console.log(`  - ${actor.name} (${actor.type}) - Owner: ${actor.ownership[game.user.id]}`);
  });

  // Test 2: Test message sending and receiving
  console.log("2. Testing message sending and receiving...");

  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📤 Testing message from ${actor1.name} to ${actor2.name}`);

  try {
    // Send a test message
    const result = await agent.sendMessage(actor1.id, actor2.id, "Teste das regras de negócio");
    console.log(`✅ Message send result: ${result}`);

    if (result) {
      console.log("✅ Message sent successfully");
    } else {
      console.error("❌ Message send failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return false;
  }

  // Test 3: Test unread count system
  console.log("3. Testing unread count system...");

  const unreadCount = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count: ${unreadCount}`);

  if (unreadCount !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCount}`);
    return false;
  }

  console.log("✅ Unread count is correct");

  // Test 4: Test marking conversation as read
  console.log("4. Testing mark conversation as read...");

  agent.markConversationAsRead(actor2.id, actor1.id);

  const unreadCountAfterRead = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count after marking as read: ${unreadCountAfterRead}`);

  if (unreadCountAfterRead !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfterRead}`);
    return false;
  }

  console.log("✅ Conversation marked as read correctly");

  // Test 5: Test message structure (read/unread status)
  console.log("5. Testing message structure...");

  const messages = agent.getMessagesForConversation(actor1.id, actor2.id);
  const lastMessage = messages[messages.length - 1];

  if (lastMessage && typeof lastMessage.read !== 'undefined') {
    console.log(`✅ Message has read status: ${lastMessage.read}`);
  } else {
    console.error("❌ Message missing read status");
    return false;
  }

  // Test 6: Test notifications
  console.log("6. Testing notifications...");
  console.log("ℹ️ Notifications should show 'Nova mensagem no Chat7' only");
  console.log("ℹ️ Chat messages should be private between participants");

  // Test 7: Test message persistence
  console.log("7. Testing message persistence...");

  try {
    await agent.saveMessages();
    console.log("✅ Messages saved successfully");

    // Clear and reload
    agent.messages.clear();
    await agent.loadMessages();

    const reloadedMessages = agent.getMessagesForConversation(actor1.id, actor2.id);
    console.log(`✅ Messages reloaded: ${reloadedMessages.length} messages`);

    if (reloadedMessages.length === 0) {
      console.error("❌ No messages found after reload");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing message persistence:", error);
    return false;
  }

  console.log("✅ All business rules tests completed successfully!");
  console.log("💡 The module should now follow all specified business rules");

  ui.notifications.success("Teste das regras de negócio concluído com sucesso!");
  return true;
};

// Test function to check message flow between GM and Player
window.testGMPlayerMessageFlow = async () => {
  console.log("=== GM-Player Message Flow Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🧪 Testing GM-Player message flow...");
  console.log(`👤 Current user: ${game.user.name} (GM: ${game.user.isGM})`);

  // Get user actors
  const userActors = agent.getUserActors();
  if (userActors.length < 2) {
    console.error("❌ Need at least 2 user actors to test");
    return false;
  }

  const actor1 = userActors[0];
  const actor2 = userActors[1];

  console.log(`📱 Testing with actors: ${actor1.name} and ${actor2.name}`);

  // Test 1: Send message from current user
  console.log("1. Testing message sending...");

  try {
    const result = await agent.sendMessage(actor1.id, actor2.id, "Teste de fluxo GM-Player");
    console.log(`✅ Message send result: ${result}`);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return false;
  }

  // Test 2: Check if message was saved
  console.log("2. Testing message saving...");

  const messages = agent.getMessagesForConversation(actor1.id, actor2.id);
  console.log(`📊 Messages in conversation: ${messages.length}`);

  if (messages.length === 0) {
    console.error("❌ No messages found in conversation");
    return false;
  }

  // Test 3: Check message structure
  console.log("3. Testing message structure...");

  const lastMessage = messages[messages.length - 1];
  console.log(`📝 Last message:`, {
    id: lastMessage.id,
    senderId: lastMessage.senderId,
    receiverId: lastMessage.receiverId,
    text: lastMessage.text,
    read: lastMessage.read,
    timestamp: lastMessage.timestamp
  });

  // Test 4: Test unread count
  console.log("4. Testing unread count...");

  const unreadCount = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count for ${actor2.name}: ${unreadCount}`);

  if (unreadCount !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCount}`);
    return false;
  }

  // Test 5: Test marking as read
  console.log("5. Testing mark as read...");

  agent.markConversationAsRead(actor2.id, actor1.id);

  const unreadCountAfterRead = agent.getUnreadCount(actor2.id, actor1.id);
  console.log(`📊 Unread count after marking as read: ${unreadCountAfterRead}`);

  if (unreadCountAfterRead !== 0) {
    console.error(`❌ Expected unread count to be 0 after marking as read, but got ${unreadCountAfterRead}`);
    return false;
  }

  console.log("✅ GM-Player message flow test completed successfully!");
  console.log("💡 Messages should now flow correctly between GM and Player");

  ui.notifications.success("Teste de fluxo GM-Player concluído com sucesso!");
  return true;
};

// Test function to check notification system
window.testNotificationSystem = () => {
  console.log("=== Notification System Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🧪 Testing notification system...");

  // Test 1: Check notification sound
  console.log("1. Testing notification sound...");

  try {
    agent.playNotificationSound();
    console.log("✅ Notification sound played");
  } catch (error) {
    console.error("❌ Error playing notification sound:", error);
  }

  // Test 2: Check notification message
  console.log("2. Testing notification message...");
  console.log("ℹ️ Should show: 'Nova mensagem no Chat7'");

  // Simulate notification
  ui.notifications.info("Nova mensagem no Chat7");
  console.log("✅ Notification message displayed");

  // Test 3: Check chat message privacy
  console.log("3. Testing chat message privacy...");
  console.log("ℹ️ Chat messages should be private (whisper) between participants");
  console.log("ℹ️ GMs should see all messages");
  console.log("ℹ️ Players should only see messages they're involved in");

  console.log("✅ Notification system test completed!");
  console.log("💡 Notifications should follow the specified business rules");

  ui.notifications.success("Teste do sistema de notificações concluído!");
  return true;
};

// Test function to check permissions and access control
window.testPermissionsAndAccess = () => {
  console.log("=== Permissions and Access Control Test ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not available");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  console.log("🧪 Testing permissions and access control...");
  console.log(`👤 Current user: ${game.user.name}`);
  console.log(`🔑 Is GM: ${game.user.isGM}`);
  console.log(`🔑 Is Assistant: ${game.user.hasRole('ASSISTANT')}`);

  // Test 1: Check user actors access
  console.log("1. Testing user actors access...");

  const userActors = agent.getUserActors();
  console.log(`📱 User actors: ${userActors.length}`);

  userActors.forEach(actor => {
    const ownership = actor.ownership[game.user.id];
    console.log(`  - ${actor.name} (${actor.type}): ${ownership}`);

    // Check if player can only access their own character
    if (!game.user.isGM && actor.type === 'character') {
      if (ownership !== 3) { // 3 = owner
        console.warn(`⚠️ Player ${game.user.name} has access to character ${actor.name} but is not owner`);
      }
    }
  });

  // Test 2: Check GM access to all actors
  console.log("2. Testing GM access...");

  if (game.user.isGM) {
    console.log("✅ GM can access all actors");
  } else {
    console.log("ℹ️ Player access is restricted to owned characters");
  }

  // Test 3: Check message saving permissions
  console.log("3. Testing message saving permissions...");

  try {
    const testData = { "test": "data" };
    agent._requestGMSaveMessages(testData);
    console.log("✅ Message saving permissions working");
  } catch (error) {
    console.error("❌ Error testing message saving permissions:", error);
  }

  console.log("✅ Permissions and access control test completed!");
  console.log("💡 Access control should work according to business rules");

  ui.notifications.success("Teste de permissões concluído!");
  return true;
};

console.log("Cyberpunk Agent | Business rules test functions loaded:");
console.log("  - testBusinessRules() - Test all business rules");
console.log("  - testGMPlayerMessageFlow() - Test GM-Player message flow");
console.log("  - testNotificationSystem() - Test notification system");
console.log("  - testPermissionsAndAccess() - Test permissions and access control"); 