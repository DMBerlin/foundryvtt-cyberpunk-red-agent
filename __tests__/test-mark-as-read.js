/**
 * Test script for mark as read functionality
 * Tests: automatic marking when opening chat, real-time unread count updates, and context menu option
 */

console.log("🧪 Cyberpunk Agent | Testing mark as read functionality...");

// Test function for mark as read functionality
window.testMarkAsRead = async () => {
  console.log("=== Testing Mark as Read Functionality ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    ui.notifications.error("Instância do CyberpunkAgent não encontrada!");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors for testing
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors for mark as read test");
    ui.notifications.error("Precisa de pelo menos 2 personagens para testar!");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`📱 Testing mark as read between ${actor1.name} and ${actor2.name}`);

  // Test 1: Send a message to create unread count
  console.log("1. Sending test message...");
  await agent.sendMessage(actor2.id, actor1.id, "Mensagem para teste de marcação como lida");

  // Test 2: Check unread count (should be 1)
  console.log("2. Checking unread count...");
  const unreadCountBefore = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Unread count before marking as read: ${unreadCountBefore}`);

  if (unreadCountBefore !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCountBefore}`);
    return false;
  }

  console.log("✅ Unread count is correct");

  // Test 3: Test automatic marking when opening chat conversation
  console.log("3. Testing automatic marking when opening chat...");
  
  // Simulate opening a chat conversation
  if (window.ChatConversationApplication) {
    console.log("📱 Opening chat conversation to test automatic marking...");
    const chatConversation = new window.ChatConversationApplication(actor1, actor2);
    chatConversation.render(true);
    
    // Wait a moment for the marking to occur
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check unread count after opening chat (should be 0)
    const unreadCountAfterOpen = agent.getUnreadCount(actor1.id, actor2.id);
    console.log(`📊 Unread count after opening chat: ${unreadCountAfterOpen}`);
    
    if (unreadCountAfterOpen !== 0) {
      console.error(`❌ Expected unread count to be 0 after opening chat, but got ${unreadCountAfterOpen}`);
      return false;
    }
    
    console.log("✅ Automatic marking when opening chat works correctly");
    
    // Close the chat conversation
    chatConversation.close();
  } else {
    console.warn("⚠️ ChatConversationApplication not available, skipping automatic marking test");
  }

  // Test 4: Send another message and test context menu marking
  console.log("4. Sending another message for context menu test...");
  await agent.sendMessage(actor2.id, actor1.id, "Segunda mensagem para teste do menu de contexto");

  // Check unread count (should be 1 again)
  const unreadCountBeforeContext = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Unread count before context menu: ${unreadCountBeforeContext}`);

  if (unreadCountBeforeContext !== 1) {
    console.error(`❌ Expected unread count to be 1, but got ${unreadCountBeforeContext}`);
    return false;
  }

  // Test 5: Test context menu "mark all as read" option
  console.log("5. Testing context menu 'mark all as read' option...");
  
  if (window.Chat7Application) {
    console.log("📱 Opening Chat7 to test context menu...");
    const chat7 = new window.Chat7Application(actor1);
    chat7.render(true);
    
    // Wait for the interface to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate right-click on contact to show context menu
    const contactItem = chat7.element?.find(`[data-contact-id="${actor2.id}"]`);
    if (contactItem.length > 0) {
      console.log("📋 Found contact item, testing context menu...");
      
      // Trigger context menu
      const contextEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: contactItem[0].getBoundingClientRect().left + 10,
        clientY: contactItem[0].getBoundingClientRect().top + 10
      });
      contactItem[0].dispatchEvent(contextEvent);
      
      // Wait for context menu to appear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Look for the "mark all as read" option
      const markReadOption = $('.cp-context-menu-item[data-action="mark-read"]');
      if (markReadOption.length > 0) {
        console.log("✅ Context menu 'mark all as read' option found");
        
        // Click the option
        markReadOption.click();
        
        // Wait for the action to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check unread count after context menu action (should be 0)
        const unreadCountAfterContext = agent.getUnreadCount(actor1.id, actor2.id);
        console.log(`📊 Unread count after context menu action: ${unreadCountAfterContext}`);
        
        if (unreadCountAfterContext !== 0) {
          console.error(`❌ Expected unread count to be 0 after context menu action, but got ${unreadCountAfterContext}`);
          return false;
        }
        
        console.log("✅ Context menu 'mark all as read' works correctly");
      } else {
        console.error("❌ Context menu 'mark all as read' option not found");
        return false;
      }
    } else {
      console.error("❌ Contact item not found in Chat7 interface");
      return false;
    }
    
    // Close Chat7
    chat7.close();
  } else {
    console.warn("⚠️ Chat7Application not available, skipping context menu test");
  }

  // Test 6: Test real-time unread count updates
  console.log("6. Testing real-time unread count updates...");
  
  // Send a message while Chat7 is open
  if (window.Chat7Application) {
    console.log("📱 Opening Chat7 to test real-time updates...");
    const chat7 = new window.Chat7Application(actor1);
    chat7.render(true);
    
    // Wait for interface to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Send a message
    console.log("📤 Sending message to test real-time update...");
    await agent.sendMessage(actor2.id, actor1.id, "Mensagem para teste de atualização em tempo real");
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if unread count updated in the interface
    const unreadElement = chat7.element?.find(`[data-contact-id="${actor2.id}"] .cp-unread-count`);
    if (unreadElement.length > 0) {
      const displayedCount = parseInt(unreadElement.text());
      console.log(`📊 Unread count displayed in interface: ${displayedCount}`);
      
      if (displayedCount === 1) {
        console.log("✅ Real-time unread count update works correctly");
      } else {
        console.error(`❌ Expected displayed count to be 1, but got ${displayedCount}`);
        return false;
      }
    } else {
      console.error("❌ Unread count element not found in interface");
      return false;
    }
    
    // Close Chat7
    chat7.close();
  } else {
    console.warn("⚠️ Chat7Application not available, skipping real-time update test");
  }

  console.log("✅ All mark as read functionality tests completed successfully!");
  console.log("💡 Features tested:");
  console.log("   - Automatic marking when opening chat conversation");
  console.log("   - Context menu 'mark all as read' option");
  console.log("   - Real-time unread count updates");
  console.log("   - Proper unread count calculation");

  ui.notifications.success("Teste de marcação como lida concluído com sucesso!");
  return true;
};

// Test function for manual mark as read
window.testManualMarkAsRead = async () => {
  console.log("=== Testing Manual Mark as Read ===");

  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent instance not found");
    return false;
  }

  const agent = window.CyberpunkAgent.instance;

  // Get character actors
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.error("❌ Need at least 2 character actors");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  // Send a message
  console.log("📤 Sending test message...");
  await agent.sendMessage(actor2.id, actor1.id, "Mensagem para teste manual");

  // Check unread count
  const unreadCountBefore = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Unread count before manual marking: ${unreadCountBefore}`);

  // Manually mark as read
  console.log("📖 Manually marking conversation as read...");
  agent.markConversationAsRead(actor1.id, actor2.id);

  // Check unread count after
  const unreadCountAfter = agent.getUnreadCount(actor1.id, actor2.id);
  console.log(`📊 Unread count after manual marking: ${unreadCountAfter}`);

  if (unreadCountAfter === 0) {
    console.log("✅ Manual mark as read works correctly");
    ui.notifications.success("Teste manual de marcação como lida concluído!");
    return true;
  } else {
    console.error(`❌ Expected unread count to be 0, but got ${unreadCountAfter}`);
    return false;
  }
};

console.log("🧪 Mark as read test functions loaded:");
console.log("   - testMarkAsRead() - Full functionality test");
console.log("   - testManualMarkAsRead() - Manual marking test"); 