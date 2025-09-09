/**
 * SocketLib Integration for Cyberpunk Agent
 * Provides robust real-time communication between clients
 * Following official SocketLib documentation and Sequencer patterns
 */

console.log("Cyberpunk Agent | Loading SocketLib integration...");

let socket;

// SocketLib integration will be initialized by the main module
// This file only contains the handler functions and the SocketLibIntegration class

/**
 * Initialize SocketLib integration
 * This function should be called by the main module when SocketLib is ready
 */
function initializeSocketLib() {
  console.log("Cyberpunk Agent | Initializing SocketLib integration...");

  try {
    // Check if socketlib is available
    if (typeof socketlib === 'undefined') {
      console.error("Cyberpunk Agent | SocketLib is undefined, cannot register module");
      return false;
    }

    // Check if already initialized to prevent duplicate registration
    if (window.socket && socket) {
      console.log("Cyberpunk Agent | SocketLib already initialized, skipping duplicate registration");
      return true;
    }

    // Register our module with SocketLib - FOLLOWING OFFICIAL DOCUMENTATION
    socket = socketlib.registerModule("cyberpunk-agent");
    console.log("Cyberpunk Agent | Module registered with SocketLib:", socket);

    // Check if socket was properly created
    if (!socket) {
      console.error("Cyberpunk Agent | Socket registration failed - socket is null/undefined");
      return false;
    }

    // Make socket globally available
    window.socket = socket;

    // Register our functions that can be called remotely - IMMEDIATELY AFTER REGISTRATION
    console.log("Cyberpunk Agent | Registering SocketLib functions...");

    // Check if register method exists
    if (typeof socket.register !== 'function') {
      console.error("Cyberpunk Agent | Socket register method not available");
      console.error("Socket object:", socket);
      console.error("Socket methods:", Object.keys(socket).filter(key => typeof socket[key] === 'function'));
      return false;
    }

    // Register all functions - following official documentation pattern
    // These will be registered on all clients when the module loads
    socket.register("contactUpdate", handleContactUpdate);
    socket.register("messageUpdate", handleMessageUpdate);
    socket.register("deviceMessageUpdate", handleDeviceMessageUpdate);
    socket.register("messageDeletion", handleMessageDeletion);
    socket.register("deviceMessageDeletion", handleDeviceMessageDeletion);
    socket.register("conversationClear", handleConversationClear);
    socket.register("sendMessage", handleSendMessage);
    socket.register("saveMessages", handleSaveMessages);
    socket.register("saveMessagesResponse", handleSaveMessagesResponse);
    socket.register("requestMessageSync", handleMessageSyncRequest);
    socket.register("messageSyncResponse", handleMessageSyncResponse);
    socket.register("ping", handlePing);
    socket.register("testConnection", handleTestConnection);
    socket.register("broadcastUpdate", handleBroadcastUpdate);
    socket.register("requestGMPhoneNumberSave", handleRequestGMPhoneNumberSave);
    socket.register("requestGMDeviceDataSave", handleRequestGMDeviceDataSave);

    socket.register("gmPhoneNumberSaveResponse", handleGMPhoneNumberSaveResponse);
    socket.register("gmDeviceDataSaveResponse", handleGMDeviceDataSaveResponse);

    socket.register("requestDeviceMessageSync", handleDeviceMessageSyncRequest);
    socket.register("deviceMessageSyncResponse", handleDeviceMessageSyncResponse);

    // Cyberpunk Agent Master Reset handler
    socket.register("cyberpunkAgentMasterReset", handleCyberpunkAgentMasterReset);

    // Register GM data management handlers
    socket.register("allMessagesCleared", handleAllMessagesCleared);
    socket.register("allContactListsCleared", handleAllContactListsCleared);
    socket.register("allDevicesSynchronized", handleAllDevicesSynchronized);

    console.log("Cyberpunk Agent | SocketLib functions registered successfully");

    console.log("Cyberpunk Agent | SocketLib module and functions registered successfully");

    // Test the setup
    testSocketLibSetup();

    return true;
  } catch (error) {
    console.error("Cyberpunk Agent | Error registering module with SocketLib:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      socketlibAvailable: typeof socketlib !== 'undefined',
      socketlibVersion: socketlib ? socketlib.version : 'unknown',
      socketlibMethods: socketlib ? Object.keys(socketlib).filter(key => typeof socketlib[key] === 'function') : []
    });
    return false;
  }
}

/**
 * Test SocketLib setup
 */
function testSocketLibSetup() {
  try {
    // Check if module is registered
    const modules = socketlib.modules && Array.isArray(socketlib.modules) ? socketlib.modules : [];
    const isRegistered = modules.includes('cyberpunk-agent');
    console.log(`Cyberpunk Agent | Module registered with SocketLib: ${isRegistered}`);

    // Log available methods
    console.log("Cyberpunk Agent | SocketLib methods:", Object.keys(socketlib).filter(key => typeof socketlib[key] === 'function'));

    if (!isRegistered) {
      console.warn("Cyberpunk Agent | Module not properly registered with SocketLib");
    }

    // Test if our socket has the required methods
    if (socket) {
      const socketMethods = Object.keys(socket).filter(key => typeof socket[key] === 'function');
      console.log("Cyberpunk Agent | Socket methods:", socketMethods);

      const requiredMethods = ['executeForEveryone', 'executeForOthers', 'executeAsGM', 'executeAsUser'];
      const missingMethods = requiredMethods.filter(method => !socketMethods.includes(method));

      if (missingMethods.length > 0) {
        console.warn("Cyberpunk Agent | Missing required socket methods:", missingMethods);
      } else {
        console.log("Cyberpunk Agent | All required socket methods available");
      }
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
    window.CyberpunkAgent.instance.loadDeviceData();
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
 * Handle device message update from other clients
 */
async function handleDeviceMessageUpdate(data) {
  console.log("Cyberpunk Agent | Received device message update via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own device message update notification");
    return;
  }

  // Check if this is a recent update to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore updates older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old device message update notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing device message update from:", data.userName);

  // Call the main module's device message update handler
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("Cyberpunk Agent | Calling main module device message update handler...");
    await window.CyberpunkAgent.instance.handleDeviceMessageUpdate(data);
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for device message update");

    // Fallback: reload device data from settings
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      console.log("Cyberpunk Agent | Reloading agent data...");
      window.CyberpunkAgent.instance.loadDeviceData();
    }

    // Fallback: update all open interfaces
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      console.log("Cyberpunk Agent | Updating open interfaces...");
      window.CyberpunkAgent.instance.updateOpenInterfaces();
    }
  }

  // Visual notifications are now handled by playNotificationSound function
  console.log("Cyberpunk Agent | Visual notifications handled by playNotificationSound function");

  console.log("Cyberpunk Agent | Device message update processed via SocketLib successfully");
}

/**
 * Handle message update from other clients
 */
async function handleMessageUpdate(data) {
  console.log("Cyberpunk Agent | Received message update via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own message update notification");
    return;
  }

  // Check if this is a recent update to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore updates older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old message update notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing message update from:", data.userName);

  // If we have message data, add it to the conversation locally
  if (data.message && data.senderId && data.receiverId) {
    console.log("Cyberpunk Agent | Adding message to local conversation via SocketLib:", data.message);

    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      try {
        // Get the conversation key - check if these are device IDs or actor IDs
        let conversationKey;
        let isDeviceMessage = false;

        // Check if these look like device IDs (they should be in the devices map)
        if (window.CyberpunkAgent.instance.devices.has(data.senderId) ||
          window.CyberpunkAgent.instance.devices.has(data.receiverId)) {
          conversationKey = window.CyberpunkAgent.instance._getDeviceConversationKey(data.senderId, data.receiverId);
          isDeviceMessage = true;
        } else {
          conversationKey = window.CyberpunkAgent.instance._getConversationKey(data.senderId, data.receiverId);
        }

        // Get or create conversation
        if (!window.CyberpunkAgent.instance.messages.has(conversationKey)) {
          window.CyberpunkAgent.instance.messages.set(conversationKey, []);
        }

        const conversation = window.CyberpunkAgent.instance.messages.get(conversationKey);

        // Check if message already exists to avoid duplicates
        const messageExists = conversation.some(msg => msg.id === data.message.id);
        if (!messageExists) {
          // Add the message
          conversation.push(data.message);

          // Save messages for both sender and receiver
          if (isDeviceMessage) {
            await window.CyberpunkAgent.instance.saveMessagesForDevice(data.senderId);
            if (data.senderId !== data.receiverId) {
              await window.CyberpunkAgent.instance.saveMessagesForDevice(data.receiverId);
            }
          } else {
            await window.CyberpunkAgent.instance.saveMessagesForActor(data.senderId);
            if (data.senderId !== data.receiverId) {
              await window.CyberpunkAgent.instance.saveMessagesForActor(data.receiverId);
            }
          }
          console.log("Cyberpunk Agent | Message added to local conversation via SocketLib successfully");
        } else {
          console.log("Cyberpunk Agent | Message already exists in conversation via SocketLib, skipping");
        }
      } catch (error) {
        console.error("Cyberpunk Agent | Error adding message to local conversation via SocketLib:", error);
      }
    } else {
      console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for message addition");
    }
  } else {
    // Fallback: reload message data from settings
    console.log("Cyberpunk Agent | No message data provided via SocketLib, reloading from settings");
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.loadDeviceData();
      window.CyberpunkAgent.instance.loadMessages();
    } else {
      console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for data reload");
    }
  }

  // Update all open chat interfaces immediately
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    console.log("Cyberpunk Agent | Updating chat interfaces via SocketLib...");
    window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
    window.CyberpunkAgent.instance.updateOpenInterfaces();
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for interface update");
  }

  // Notifications are handled by handleSendMessage function
  console.log("Cyberpunk Agent | Notifications handled by handleSendMessage function");

  console.log("Cyberpunk Agent | Message update processed via SocketLib successfully");
}

/**
 * Handle message deletion from other clients
 */
async function handleMessageDeletion(data) {
  console.log("Cyberpunk Agent | Received message deletion via SocketLib:", data);

  // Prevent processing our own deletions
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own message deletion notification");
    return;
  }

  // Check if this is a recent deletion to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore deletions older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old message deletion notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing message deletion from:", data.userName);

  try {
    const { actorId1, actorId2, messageIds } = data.data;

    // Handle the deletion through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.handleMessageDeletion(data);
    } else {
      console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for message deletion");
    }

    // Show notification to user
    const actor1 = game.actors.get(actorId1);
    const actor2 = game.actors.get(actorId2);
    const actor1Name = actor1 ? actor1.name : "Desconhecido";
    const actor2Name = actor2 ? actor2.name : "Desconhecido";

    const message = `${messageIds.length} mensagem${messageIds.length > 1 ? 'ns' : ''} deletada${messageIds.length > 1 ? 's' : ''} da conversa entre ${actor1Name} e ${actor2Name}`;
    ui.notifications.info(message);

    console.log(`Cyberpunk Agent | Deleted ${messageIds.length} messages from conversation`);
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling message deletion:", error);
  }
}

/**
 * Handle device message deletion from other clients
 */
async function handleDeviceMessageDeletion(data) {
  console.log("Cyberpunk Agent | Received device message deletion via SocketLib:", data);

  // Prevent processing our own deletions
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own device message deletion notification");
    return;
  }

  // Check if this is a recent deletion to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore deletions older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old device message deletion notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing device message deletion from:", data.userName);

  try {
    const { deviceId, contactDeviceId, messageIds } = data.data;

    // Handle the deletion through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.handleDeviceMessageDeletion(data);
    } else {
      console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for device message deletion");
    }

    // Show notification to user
    const device = window.CyberpunkAgent?.instance?.devices?.get(deviceId);
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactDeviceId);
    const deviceName = device ? device.deviceName : "Device " + deviceId;
    const contactName = contactDevice ? contactDevice.deviceName : "Device " + contactDeviceId;

    const message = `${messageIds.length} mensagem${messageIds.length > 1 ? 'ns' : ''} deletada${messageIds.length > 1 ? 's' : ''} da conversa entre ${deviceName} e ${contactName}`;
    ui.notifications.info(message);

    console.log(`Cyberpunk Agent | Deleted ${messageIds.length} messages from device conversation`);
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling device message deletion:", error);
  }
}

/**
 * Handle conversation clear from other clients
 */
async function handleConversationClear(data) {
  console.log("Cyberpunk Agent | Received conversation clear via SocketLib:", data);

  // Prevent processing our own conversation clear
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own conversation clear notification");
    return;
  }

  // Check if this is a recent clear to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore clears older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old conversation clear notification (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing conversation clear from:", data.userName);

  try {
    const { actorId, contactId } = data.data;

    // Handle the conversation clear through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Clear the conversation for the current user's view
      const conversationKey = window.CyberpunkAgent.instance._getConversationKey(actorId, contactId);
      window.CyberpunkAgent.instance.messages.set(conversationKey, []);

      // Clear unread count cache
      const unreadCacheKey = `${actorId}-${contactId}`;
      window.CyberpunkAgent.instance.unreadCounts.delete(unreadCacheKey);

      // Update interfaces
      window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
    } else {
      console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for conversation clear");
    }

    // Show notification to user
    const actor = game.actors.get(actorId);
    const contact = game.actors.get(contactId);
    const actorName = actor ? actor.name : "Desconhecido";
    const contactName = contact ? contact.name : "Desconhecido";

    const message = `Histórico de conversa limpo por ${actorName} na conversa com ${contactName}`;
    ui.notifications.info(message);

    console.log(`Cyberpunk Agent | Conversation cleared by ${actorName} with ${contactName}`);
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling conversation clear:", error);
  }
}

/**
 * Handle all messages cleared notification
 */
async function handleAllMessagesCleared(data) {
  console.log("Cyberpunk Agent | Received all messages cleared notification via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own all messages cleared notification");
    return;
  }

  try {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Clear local messages
      window.CyberpunkAgent.instance.messages.clear();
      window.CyberpunkAgent.instance.lastReadTimestamps.clear();

      // Clear localStorage for current user
      const messagesStorageKey = `cyberpunk-agent-messages-${game.user.id}`;
      const timestampsStorageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
      localStorage.removeItem(messagesStorageKey);
      localStorage.removeItem(timestampsStorageKey);

      console.log("Cyberpunk Agent | Cleared all messages locally");

      // Update all open interfaces
      window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
      window.CyberpunkAgent.instance.updateOpenInterfaces();

      // Show notification
      ui.notifications.info("All chat message histories have been cleared by the GM");
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling all messages cleared:", error);
  }
}

/**
 * Handle all contact lists cleared broadcast
 */
async function handleAllContactListsCleared(data) {
  console.log("Cyberpunk Agent | Received all contact lists cleared broadcast via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own all contact lists cleared notification");
    return;
  }

  try {
    // Clear contact lists from all devices but keep the devices themselves
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      let clearedCount = 0;

      for (const [deviceId, device] of window.CyberpunkAgent.instance.devices) {
        if (device.contacts && device.contacts.length > 0) {
          device.contacts = [];
          clearedCount++;
        }
      }

      // Update all open interfaces
      window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
      window.CyberpunkAgent.instance.updateOpenInterfaces();

      console.log(`Cyberpunk Agent | Contact lists cleared from ${clearedCount} devices`);

      // Show notification
      ui.notifications.info("All contact lists have been cleared by the GM");
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling all contact lists cleared broadcast:", error);
  }
}

/**
 * Handle all devices synchronized broadcast
 */
async function handleAllDevicesSynchronized(data) {
  console.log("Cyberpunk Agent | Received all devices synchronized broadcast via SocketLib:", data);

  // Prevent processing our own updates
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own all devices synchronized notification");
    return;
  }

  try {
    // Reload device and phone number data to get the latest synchronized state
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Reload device data
      window.CyberpunkAgent.instance.loadDeviceData();

      // Reload phone number data
      window.CyberpunkAgent.instance.loadPhoneNumberData();

      // Update all open interfaces
      window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
      window.CyberpunkAgent.instance.updateOpenInterfaces();

      console.log(`Cyberpunk Agent | Devices synchronized: ${data.synchronizedCount || 0} devices, ${data.updatedCount || 0} updated`);

      // Show notification
      ui.notifications.info(`All devices have been synchronized by the GM (${data.synchronizedCount || 0} devices, ${data.updatedCount || 0} updated)`);
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling all devices synchronized broadcast:", error);
  }
}

/**
 * Handle send message from other clients
 */
async function handleSendMessage(data) {
  console.log("Cyberpunk Agent | Received send message via SocketLib:", data);

  // Prevent processing our own messages
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own message");
    return;
  }

  // Check if this is a system message (not a chat message)
  if (data.senderId === 'saveMessagesResponse' || data.senderId === 'system' || !data.text) {
    console.log("Cyberpunk Agent | Ignoring system message:", data.senderId);
    return;
  }

  // Enhanced deduplication check
  if (window.CyberpunkAgentMessageDeduplication) {
    if (window.CyberpunkAgentMessageDeduplication.isDuplicate(data.messageId)) {
      console.log("Cyberpunk Agent | Duplicate message detected via SocketLib:", data.messageId);
      return;
    }
    window.CyberpunkAgentMessageDeduplication.addMessage(data.messageId, data.timestamp);
  }

  // Check if this is a recent message (enhanced check)
  if (window.CyberpunkAgentMessageUtils) {
    if (!window.CyberpunkAgentMessageUtils.isRecentMessage(data.timestamp, 30000)) {
      console.log("Cyberpunk Agent | Ignoring old message (age:", Date.now() - data.timestamp, "ms)");
      return;
    }
  } else {
    // Fallback to old method
    const now = Date.now();
    const timeDiff = now - data.timestamp;
    if (timeDiff > 30000) {
      console.log("Cyberpunk Agent | Ignoring old message (age:", timeDiff, "ms)");
      return;
    }
  }

  console.log("Cyberpunk Agent | Processing message from:", data.userName);

  // Add the message to the conversation
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    try {
      // Get the conversation key - check if these are device IDs or actor IDs
      let conversationKey;
      let isDeviceMessage = false;

      // Check if these look like device IDs (they should be in the devices map)
      if (window.CyberpunkAgent.instance.devices.has(data.senderId) ||
        window.CyberpunkAgent.instance.devices.has(data.receiverId)) {
        conversationKey = window.CyberpunkAgent.instance._getDeviceConversationKey(data.senderId, data.receiverId);
        isDeviceMessage = true;
      } else {
        conversationKey = window.CyberpunkAgent.instance._getConversationKey(data.senderId, data.receiverId);
      }

      // Get or create conversation
      if (!window.CyberpunkAgent.instance.messages.has(conversationKey)) {
        window.CyberpunkAgent.instance.messages.set(conversationKey, []);
      }

      const conversation = window.CyberpunkAgent.instance.messages.get(conversationKey);

      // Check if message already exists to avoid duplicates
      const existingMessage = conversation.find(msg => msg.id === data.messageId);
      if (existingMessage) {
        console.log("Cyberpunk Agent | Message already exists, skipping duplicate");
        return;
      }

      // Add the message
      const message = {
        id: data.messageId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        timestamp: data.timestamp,
        time: new Date(data.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        read: false // New message is always unread
      };

      conversation.push(message);

      // Save messages for both sender and receiver
      if (isDeviceMessage) {
        await window.CyberpunkAgent.instance.saveMessagesForDevice(data.senderId);
        if (data.senderId !== data.receiverId) {
          await window.CyberpunkAgent.instance.saveMessagesForDevice(data.receiverId);
        }
      } else {
        await window.CyberpunkAgent.instance.saveMessagesForActor(data.senderId);
        if (data.senderId !== data.receiverId) {
          await window.CyberpunkAgent.instance.saveMessagesForActor(data.receiverId);
        }
      }

      console.log("Cyberpunk Agent | Message added to conversation:", message);

      // Update all open chat interfaces immediately
      console.log("Cyberpunk Agent | Updating chat interfaces...");
      window.CyberpunkAgent.instance._updateChatInterfacesImmediately();
      window.CyberpunkAgent.instance.updateOpenInterfaces();

      // Visual notifications are now handled by playNotificationSound function
      console.log("Cyberpunk Agent | Visual notifications handled by playNotificationSound function");

      // Enhanced notification handling
      if (data.receiverId) {
        // Check if the current user is the actual owner of the receiving device
        const receiverUser = window.CyberpunkAgent.instance._getUserForDevice(data.receiverId);
        let isReceiver = false;

        if (receiverUser && receiverUser.id === game.user.id) {
          isReceiver = true;
        } else {
          // Fallback: check if it's a direct actor message (legacy support)
          const userActors = window.CyberpunkAgent.instance.getUserActors();
          isReceiver = userActors.some(actor => actor.id === data.receiverId);
        }

        if (isReceiver) {
          console.log("Cyberpunk Agent | Handling notifications for received message - user is the actual receiver");

          // Use smart notification manager if available
          if (window.CyberpunkAgentNotificationManager) {
            const message = {
              id: data.messageId,
              senderId: data.senderId,
              receiverId: data.receiverId,
              text: data.text,
              timestamp: data.timestamp
            };

            window.CyberpunkAgentNotificationManager.showNotification(message, game.user.id, data.receiverId);
          } else {
            // Fallback to original method
            window.CyberpunkAgent.instance.handleNewMessageNotifications(data.senderId, data.receiverId);
          }
        } else {
          console.log("Cyberpunk Agent | User is not the actual receiver device owner, skipping notifications");
        }
      }

      console.log("Cyberpunk Agent | Message processed via SocketLib successfully");
    } catch (error) {
      console.error("Cyberpunk Agent | Error processing message:", error);
    }
  } else {
    console.error("Cyberpunk Agent | CyberpunkAgent instance not available for message processing");
  }
}

/**
 * Handle save messages request from players
 */
async function handleSaveMessages(data) {
  console.log("Cyberpunk Agent | Received save messages request via SocketLib:", data);

  // Only GMs can save messages
  if (!game.user.isGM) {
    console.log("Cyberpunk Agent | Non-GM user cannot save messages");
    return;
  }

  // Check if this is a recent request to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore requests older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old save request (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing save request from:", data.userName);

  try {
    // Save the messages to localStorage (deprecated GM save functionality)
    console.log("Cyberpunk Agent | Save messages request ignored - using localStorage only architecture for user:", data.userName);

    // Notify the requesting user that save was successful
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      await window.CyberpunkAgent.instance.socketLibIntegration.sendSystemResponseToUser(data.userId, 'saveMessagesResponse', {
        success: true,
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        requestingUserId: data.userId // Add the requesting user ID
      });
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error saving messages:", error);

    // Notify the requesting user that save failed
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      await window.CyberpunkAgent.instance.socketLibIntegration.sendSystemResponseToUser(data.userId, 'saveMessagesResponse', {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        requestingUserId: data.userId // Add the requesting user ID
      });
    }
  }
}

/**
 * Handle save messages response from GM
 */
async function handleSaveMessagesResponse(data) {
  console.log("Cyberpunk Agent | Received save messages response via SocketLib:", data);

  // Check if this response is for us
  if (data.requestingUserId !== game.user.id) {
    console.log("Cyberpunk Agent | Save response not for us, ignoring");
    return;
  }

  // Check if this is a recent response to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore responses older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old save response (age:", timeDiff, "ms)");
    return;
  }

  if (data.success) {
    console.log("Cyberpunk Agent | Messages saved successfully by GM");
    console.log("Cyberpunk Agent | Mensagens salvas com sucesso!");
  } else {
    console.error("Cyberpunk Agent | Failed to save messages:", data.error);
    ui.notifications.error("Erro ao salvar mensagens: " + data.error);
  }
}

/**
 * Handle message synchronization request from other clients
 */
async function handleMessageSyncRequest(data) {
  console.log("Cyberpunk Agent | Received message sync request via SocketLib:", data);

  // Prevent processing our own requests
  if (data.requestingUserId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own message sync request");
    return;
  }

  // Check if this is a recent request to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore requests older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old message sync request (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing message sync request from:", data.requestingUserName);

  // Handle the sync request through CyberpunkAgent
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    await window.CyberpunkAgent.instance.handleMessageSyncRequest(data);
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for message sync request");
  }
}

/**
 * Handle message synchronization response from other clients
 */
async function handleMessageSyncResponse(data) {
  console.log("Cyberpunk Agent | Received message sync response via SocketLib:", data);

  // Check if this response is for us
  if (data.requestingUserId !== game.user.id) {
    console.log("Cyberpunk Agent | Message sync response not for us, ignoring");
    return;
  }

  // Check if this is a recent response to avoid duplicates
  const now = Date.now();
  const timeDiff = now - data.timestamp;
  if (timeDiff > 30000) { // Ignore responses older than 30 seconds
    console.log("Cyberpunk Agent | Ignoring old message sync response (age:", timeDiff, "ms)");
    return;
  }

  console.log("Cyberpunk Agent | Processing message sync response from:", data.respondingUserName);

  // Handle the sync response through CyberpunkAgent
  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    await window.CyberpunkAgent.instance.handleMessageSyncResponse(data);
  } else {
    console.warn("Cyberpunk Agent | CyberpunkAgent instance not available for message sync response");
  }
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

  // Process the update based on type
  if (data.type === 'contactUpdate') {
    await handleContactUpdate(data);
  } else if (data.type === 'messageUpdate') {
    await handleMessageUpdate(data);
  } else if (data.type === 'deviceMessageUpdate') {
    await handleDeviceMessageUpdate(data);
  } else if (data.type === 'allMessagesCleared') {
    await handleAllMessagesCleared(data);
  } else if (data.type === 'allContactListsCleared') {
    await handleAllContactListsCleared(data);
  } else if (data.type === 'allDevicesSynchronized') {
    await handleAllDevicesSynchronized(data);
  }
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

/**
 * Handle GM phone number save request from players
 */
async function handleRequestGMPhoneNumberSave(data) {
  console.log("Cyberpunk Agent | GM phone number save request received:", data);

  try {
    // Only GMs can process this request
    if (!game.user.isGM) {
      console.warn("Cyberpunk Agent | Non-GM user received GM phone number save request, ignoring");
      return;
    }

    const { phoneData, requestUserId, requestUserName } = data;

    // Save the phone number data
    game.settings.set('cyberpunk-agent', 'phone-number-data', phoneData);

    console.log(`Cyberpunk Agent | GM saved phone number data for user ${requestUserName} (${requestUserId})`);

    // Send success response back to the requesting user
    if (socket && typeof socket.executeForUser === 'function') {
      await socket.executeForUser(requestUserId, 'gmPhoneNumberSaveResponse', {
        success: true,
        timestamp: Date.now(),
        message: 'Phone number data saved successfully by GM'
      });
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling GM phone number save request:", error);

    // Send error response back to the requesting user
    if (socket && typeof socket.executeForUser === 'function') {
      await socket.executeForUser(data.requestUserId, 'gmPhoneNumberSaveResponse', {
        success: false,
        timestamp: Date.now(),
        error: error.message,
        message: 'Failed to save phone number data'
      });
    }
  }
}

/**
 * Handle GM device data save request from players
 */
async function handleRequestGMDeviceDataSave(data) {
  console.log("Cyberpunk Agent | GM device data save request received:", data);

  try {
    // Only GMs can process this request
    if (!game.user.isGM) {
      console.warn("Cyberpunk Agent | Non-GM user received GM device data save request, ignoring");
      return;
    }

    const { deviceData, requestUserId, requestUserName } = data;

    // Save the device data
    game.settings.set('cyberpunk-agent', 'device-data', deviceData);

    console.log(`Cyberpunk Agent | GM saved device data for user ${requestUserName} (${requestUserId})`);

    // Send success response back to the requesting user
    if (socket && typeof socket.executeForUser === 'function') {
      await socket.executeForUser(requestUserId, 'gmDeviceDataSaveResponse', {
        success: true,
        timestamp: Date.now(),
        message: 'Device data saved successfully by GM'
      });
    }
  } catch (error) {
    console.error("Cyberpunk Agent | Error handling GM device data save request:", error);

    // Send error response back to the requesting user
    if (socket && typeof socket.executeForUser === 'function') {
      await socket.executeForUser(data.requestUserId, 'gmDeviceDataSaveResponse', {
        success: false,
        timestamp: Date.now(),
        error: error.message,
        message: 'Failed to save device data'
      });
    }
  }
}

/**
 * Handle GM contact network save request from players
 */


/**
 * Handle GM phone number save response (for players)
 */
async function handleGMPhoneNumberSaveResponse(data) {
  console.log("Cyberpunk Agent | GM phone number save response received:", data);

  if (data.success) {
    console.log("Cyberpunk Agent | Phone number data saved successfully by GM");
    ui.notifications.info("Phone number data saved successfully by GM");
  } else {
    console.error("Cyberpunk Agent | GM failed to save phone number data:", data.error);
    ui.notifications.error(`Failed to save phone number data: ${data.error}`);
  }
}

/**
 * Handle GM device data save response (for players)
 */
async function handleGMDeviceDataSaveResponse(data) {
  console.log("Cyberpunk Agent | GM device data save response received:", data);

  if (data.success) {
    console.log("Cyberpunk Agent | Device data saved successfully by GM");
    ui.notifications.info("Device data saved successfully by GM");
  } else {
    console.error("Cyberpunk Agent | GM failed to save device data:", data.error);
    ui.notifications.error(`Failed to save device data: ${data.error}`);
  }
}

/**
 * Handle GM contact network save response (for players)
 */


/**
 * Handle device message sync request from other clients
 */
async function handleDeviceMessageSyncRequest(data) {
  console.log("Cyberpunk Agent | Received device message sync request via SocketLib:", data);

  // Prevent processing our own requests
  if (data.requestingUserId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own device message sync request");
    return;
  }

  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    try {
      const deviceId = data.deviceId;
      console.log(`Cyberpunk Agent | Processing device message sync request for device: ${deviceId}`);

      // Get all messages that involve this device
      const deviceMessages = {};

      for (const [conversationKey, messages] of window.CyberpunkAgent.instance.messages.entries()) {
        if (conversationKey.includes(deviceId)) {
          deviceMessages[conversationKey] = messages;
        }
      }

      // Send the messages back to the requesting user
      const responseData = {
        respondingUserId: game.user.id,
        respondingUserName: game.user.name,
        deviceId: deviceId,
        messages: deviceMessages,
        timestamp: Date.now()
      };

      const success = await window.CyberpunkAgent.instance.socketLibIntegration.sendMessageToUser(
        data.requestingUserId,
        'deviceMessageSyncResponse',
        responseData
      );

      if (success) {
        console.log(`Cyberpunk Agent | Device message sync response sent to ${data.requestingUserName}`);
      } else {
        console.warn(`Cyberpunk Agent | Failed to send device message sync response to ${data.requestingUserName}`);
      }
    } catch (error) {
      console.error("Cyberpunk Agent | Error processing device message sync request:", error);
    }
  }
}

/**
 * Handle device message sync response from other clients
 */
async function handleDeviceMessageSyncResponse(data) {
  console.log("Cyberpunk Agent | Received device message sync response via SocketLib:", data);

  // Prevent processing our own responses
  if (data.respondingUserId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own device message sync response");
    return;
  }

  if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
    try {
      const deviceId = data.deviceId;
      const receivedMessages = data.messages;

      console.log(`Cyberpunk Agent | Processing device message sync response for device: ${deviceId}`);
      console.log(`Cyberpunk Agent | Received ${Object.keys(receivedMessages).length} conversations`);

      let messagesAdded = 0;
      let conversationsUpdated = 0;

      // Merge received messages with local messages
      for (const [conversationKey, messages] of Object.entries(receivedMessages)) {
        if (!window.CyberpunkAgent.instance.messages.has(conversationKey)) {
          window.CyberpunkAgent.instance.messages.set(conversationKey, []);
        }

        const localConversation = window.CyberpunkAgent.instance.messages.get(conversationKey);
        let conversationUpdated = false;

        // Add any messages that don't exist locally
        for (const message of messages) {
          const messageExists = localConversation.some(localMsg => localMsg.id === message.id);
          if (!messageExists) {
            localConversation.push(message);
            messagesAdded++;
            conversationUpdated = true;
          }
        }

        if (conversationUpdated) {
          conversationsUpdated++;
        }
      }

      // Save the updated messages
      if (messagesAdded > 0) {
        await window.CyberpunkAgent.instance.saveMessagesForDevice(deviceId);
        console.log(`Cyberpunk Agent | Device message sync completed: ${messagesAdded} messages added to ${conversationsUpdated} conversations`);
      } else {
        console.log("Cyberpunk Agent | Device message sync completed: no new messages found");
      }

    } catch (error) {
      console.error("Cyberpunk Agent | Error processing device message sync response:", error);
    }
  }
}

/**
 * Handle Cyberpunk Agent Master Reset command from GM
 */
async function handleCyberpunkAgentMasterReset(data) {
  console.log("🚨 Cyberpunk Agent | Received Master Reset command via SocketLib:", data);

  // Don't process our own reset command
  if (data.userId === game.user.id) {
    console.log("Cyberpunk Agent | Ignoring own master reset command");
    return;
  }

  // Verify it's from GM
  const gmUser = game.users.get(data.userId);
  if (!gmUser || !gmUser.isGM) {
    console.warn("Cyberpunk Agent | Master reset command not from GM, ignoring");
    return;
  }

  console.log(`🚨 Cyberpunk Agent | Processing master reset from GM: ${data.userName}`);

  try {
    // Show notification to user
    ui.notifications.warn(`🚨 GM ${data.userName} executou um reset completo do sistema. Reinicializando em 3 segundos...`, { permanent: true });

    // Clear local data
    console.log("🧹 Limpando dados locais do cliente...");

    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Clear messages
      window.CyberpunkAgent.instance.messages.clear();
      window.CyberpunkAgent.instance.lastReadTimestamps.clear();
      window.CyberpunkAgent.instance.unreadCounts.clear();

      // Clear contact lists from all devices
      for (const [deviceId, device] of window.CyberpunkAgent.instance.devices) {
        if (device.contacts) {
          device.contacts = [];
        }
      }

      console.log("✅ Dados locais limpos");
    }

    // Clear localStorage
    console.log("💾 Limpando localStorage do cliente...");
    const userMessagesKey = `cyberpunk-agent-messages-${game.user.id}`;
    const userTimestampsKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
    localStorage.removeItem(userMessagesKey);
    localStorage.removeItem(userTimestampsKey);
    console.log("✅ localStorage limpo");

    // Clear enhanced system caches
    if (window.CyberpunkAgentMessageDeduplication) {
      window.CyberpunkAgentMessageDeduplication.recentMessages.clear();
      console.log("✅ Cache de deduplicação limpo");
    }

    if (window.CyberpunkAgentPerformanceManager) {
      window.CyberpunkAgentPerformanceManager.saveQueue.clear();
      if (window.CyberpunkAgentPerformanceManager.saveTimeout) {
        clearTimeout(window.CyberpunkAgentPerformanceManager.saveTimeout);
        window.CyberpunkAgentPerformanceManager.saveTimeout = null;
      }
      console.log("✅ Cache de performance limpo");
    }

    // Clear notification manager
    if (window.CyberpunkAgentNotificationManager) {
      window.CyberpunkAgentNotificationManager.activeConversations.clear();
      window.CyberpunkAgentNotificationManager.notificationCooldowns.clear();
      console.log("✅ Cache de notificações limpo");
    }

    // Clear error handler
    if (window.CyberpunkAgentErrorHandler) {
      window.CyberpunkAgentErrorHandler.fallbackQueue.clear();
      window.CyberpunkAgentErrorHandler.retryAttempts.clear();
      console.log("✅ Cache de erros limpo");
    }

    console.log("🎉 Cliente limpo com sucesso! Reinicializando...");

    // Force reload after 3 seconds
    setTimeout(() => {
      console.log("🔄 Reinicializando cliente...");
      window.location.reload();
    }, 3000);

  } catch (error) {
    console.error("❌ Erro durante limpeza do cliente:", error);
    ui.notifications.error(`Erro durante reset: ${error.message}`);

    // Still try to reload even if there was an error
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }
}

class SocketLibIntegration {
  constructor() {
    this.socketlib = socket;
    this.isAvailable = !!socket && typeof socketlib !== 'undefined';
    console.log("Cyberpunk Agent | SocketLib integration initialized, available:", this.isAvailable);

    if (!this.isAvailable) {
      console.warn("Cyberpunk Agent | SocketLib integration not available - socket:", !!socket, "socketlib:", typeof socketlib);
    }
  }

  /**
   * Update socket reference (called after SocketLib is ready)
   */
  updateSocket(newSocket) {
    this.socketlib = newSocket;
    this.isAvailable = !!newSocket && typeof socketlib !== 'undefined';
    console.log("Cyberpunk Agent | SocketLib integration updated, available:", this.isAvailable);
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

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send update");
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
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send device message update to all clients
   */
  async sendDeviceMessageUpdate(data) {
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

      console.log("Cyberpunk Agent | Attempting to send device message update via SocketLib:", updateData);

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send update");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('deviceMessageUpdate', updateData);

      console.log("Cyberpunk Agent | Device message update sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending device message update via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send message update to all clients
   */
  async sendMessageUpdate(data) {
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

      console.log("Cyberpunk Agent | Attempting to send message update via SocketLib:", updateData);

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send update");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('messageUpdate', updateData);

      console.log("Cyberpunk Agent | Message update sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending message update via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send message deletion to all clients
   */
  async sendMessageDeletion(data) {
    if (!this.isAvailable || !socket) {
      console.warn("Cyberpunk Agent | SocketLib not available, using fallback");
      return false;
    }

    try {
      const deletionData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      console.log("Cyberpunk Agent | Attempting to send message deletion via SocketLib:", deletionData);

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send deletion");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('messageDeletion', deletionData);

      console.log("Cyberpunk Agent | Message deletion sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending message deletion via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send conversation clear to all clients
   */
  async sendConversationClear(data) {
    if (!this.isAvailable || !socket) {
      console.warn("Cyberpunk Agent | SocketLib not available, using fallback");
      return false;
    }

    try {
      const clearData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      console.log("Cyberpunk Agent | Attempting to send conversation clear via SocketLib:", clearData);

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send conversation clear");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('conversationClear', clearData);

      console.log("Cyberpunk Agent | Conversation clear sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending conversation clear via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send device message deletion to all clients
   */
  async sendDeviceMessageDeletion(data) {
    if (!this.isAvailable || !socket) {
      console.warn("Cyberpunk Agent | SocketLib not available, using fallback");
      return false;
    }

    try {
      const deletionData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      console.log("Cyberpunk Agent | Attempting to send device message deletion via SocketLib:", deletionData);

      // SocketLib doesn't have a persistent connection state
      // If we have the socket object, we can attempt to send
      if (!socketlib || !socket) {
        console.warn("Cyberpunk Agent | SocketLib not available, cannot send device message deletion");
        return false;
      }

      // Send to all clients using executeForEveryone
      await socket.executeForEveryone('deviceMessageDeletion', deletionData);

      console.log("Cyberpunk Agent | Device message deletion sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending device message deletion via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket
      });
      return false;
    }
  }

  /**
   * Send message to all clients
   */
  async sendMessage(senderId, receiverId, text, messageId) {
    if (!this.isAvailable || !socket) {
      console.warn("Cyberpunk Agent | SocketLib not available, using fallback");
      return false;
    }

    try {
      const messageData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        senderId: senderId,
        receiverId: receiverId,
        text: text,
        messageId: messageId
      };

      console.log("Cyberpunk Agent | Attempting to send message via SocketLib:", messageData);

      // Check if socket has the executeForEveryone method
      if (!socket || typeof socket.executeForEveryone !== 'function') {
        console.warn("Cyberpunk Agent | Socket executeForEveryone method not available");
        console.log("Cyberpunk Agent | Available socket methods:", socket ? Object.keys(socket).filter(key => typeof socket[key] === 'function') : []);
        return false;
      }

      // Send to all clients using executeForEveryone - following official documentation
      console.log("Cyberpunk Agent | Executing sendMessage for everyone...");
      await socket.executeForEveryone('sendMessage', messageData);

      console.log("Cyberpunk Agent | Message sent via SocketLib to all clients successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending message via SocketLib:", error);
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        socketlibAvailable: !!socketlib,
        socketAvailable: !!socket,
        socketMethods: socket ? Object.keys(socket).filter(key => typeof socket[key] === 'function') : []
      });

      // Use enhanced error handling if available
      if (window.CyberpunkAgentErrorHandler) {
        const message = {
          id: messageId,
          senderId: senderId,
          receiverId: receiverId,
          text: text,
          timestamp: Date.now()
        };

        // Try fallback method (could be Foundry chat or localStorage-only)
        const fallbackMethod = async (msg) => {
          console.log("Cyberpunk Agent | Using fallback method for message:", msg.id);
          // For now, just ensure the message is saved locally
          // In a real scenario, this could try alternative communication methods
          return true;
        };

        return await window.CyberpunkAgentErrorHandler.handleSocketLibFailure(message, fallbackMethod);
      }

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
   * Send message to specific user
   */
  async sendMessageToUser(userId, senderId, receiverId, text, messageId) {
    if (!this.isAvailable || !socket) return false;

    try {
      const messageData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        senderId: senderId,
        receiverId: receiverId,
        text: text,
        messageId: messageId
      };

      // Send to specific user
      await socket.executeAsUser('sendMessage', userId, messageData);

      console.log(`Cyberpunk Agent | Message sent to user ${userId} via SocketLib`);
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending message to user via SocketLib:", error);
      return false;
    }
  }

  /**
   * Send system response to specific user
   */
  async sendSystemResponseToUser(userId, eventName, data) {
    if (!this.isAvailable || !socket) return false;

    try {
      const responseData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      // Send to specific user
      await socket.executeAsUser(eventName, userId, responseData);

      console.log(`Cyberpunk Agent | System response '${eventName}' sent to user ${userId} via SocketLib`);
      return true;
    } catch (error) {
      console.error(`Cyberpunk Agent | Error sending system response '${eventName}' to user via SocketLib:`, error);
      return false;
    }
  }

  /**
   * Send message to GM
   */
  async sendMessageToGM(eventName, data) {
    if (!this.isAvailable || !socket) return false;

    try {
      const messageData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        sessionId: game.data.id,
        ...data
      };

      // Send to GM
      await socket.executeAsGM(eventName, messageData);

      console.log(`Cyberpunk Agent | Message sent to GM via SocketLib: ${eventName}`);
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending message to GM via SocketLib:", error);
      return false;
    }
  }

  /**
   * Request GM to save phone number data
   */
  async requestGMPhoneNumberSave(phoneData) {
    if (!this.isAvailable || !socket) return false;

    try {
      const requestData = {
        phoneData: phoneData,
        requestUserId: game.user.id,
        requestUserName: game.user.name,
        timestamp: Date.now()
      };

      // Send request to GM
      await socket.executeAsGM('requestGMPhoneNumberSave', requestData);

      console.log("Cyberpunk Agent | Phone number save request sent to GM via SocketLib");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending phone number save request to GM:", error);
      return false;
    }
  }

  /**
   * Request GM to save device data
   */
  async requestGMDeviceDataSave(deviceData) {
    if (!this.isAvailable || !socket) return false;

    try {
      const requestData = {
        deviceData: deviceData,
        requestUserId: game.user.id,
        requestUserName: game.user.name,
        timestamp: Date.now()
      };

      // Send request to GM
      await socket.executeAsGM('requestGMDeviceDataSave', requestData);

      console.log("Cyberpunk Agent | Device data save request sent to GM via SocketLib");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | Error sending device data save request to GM:", error);
      return false;
    }
  }

  /**
   * Request GM to save contact networks
   */


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
   * Test message sending
   */
  async testMessageSending() {
    if (!this.isAvailable || !socket) return false;

    try {
      const testData = {
        timestamp: Date.now(),
        userId: game.user.id,
        userName: game.user.name,
        senderId: 'test-sender',
        receiverId: 'test-receiver',
        text: 'Test message via SocketLib',
        messageId: `test-${Date.now()}`
      };

      console.log("Cyberpunk Agent | Testing SocketLib message sending...");
      await socket.executeForEveryone('sendMessage', testData);
      console.log("Cyberpunk Agent | SocketLib message test sent successfully");
      return true;
    } catch (error) {
      console.error("Cyberpunk Agent | SocketLib message test failed:", error);
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
      connected: socketlib && typeof socketlib.isConnected === 'function' ? socketlib.isConnected() : false,
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
        'Connection testing',
        'Real-time message delivery'
      ]
    };
  }
}

// Create global instance
window.SocketLibIntegration = SocketLibIntegration;

// Make initialization function globally available
window.initializeSocketLib = initializeSocketLib;

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

  // Test message sending
  const messageTest = await integration.testMessageSending();
  console.log("Message test:", messageTest);

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

window.testSocketLibMessages = async () => {
  console.log("=== SocketLib Message Test ===");

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

  // Test message sending
  const result = await agent.socketLibIntegration.testMessageSending();

  if (result) {
    console.log("✅ SocketLib message test successful");
    console.log("💡 Check other clients to see if they received the message");
  } else {
    console.log("❌ SocketLib message test failed");
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
console.log("Run 'testSocketLibMessages()' to test message sending");
console.log("Run 'getSocketLibStatus()' to check SocketLib status"); 