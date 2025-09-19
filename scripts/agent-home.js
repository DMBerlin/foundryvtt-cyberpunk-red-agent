/**
 * Agent Home Application
 * The main interface for the Cyberpunk Agent
 */

console.log("Cyberpunk Agent | Loading agent-home.js...");

/**
 * Unified Agent Application - Single instance for all Agent screens
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class AgentApplication extends FormApplication {
  constructor(device, options = {}) {
    super(device, options);
    this.device = device;
    this.currentView = 'home'; // 'home', 'chat7', 'conversation', 'zmail', 'zmail-message', 'memo', 'memo-note'
    this.currentContact = null;
    this.currentZMailMessage = null;
    this.currentMemoNote = null;
    this.views = {
      home: this._renderHomeView.bind(this),
      chat7: this._renderChat7View.bind(this),
      conversation: this._renderConversationView.bind(this),
      'add-contact': this._renderAddContactView.bind(this),
      zmail: this._renderZMailView.bind(this),
      'zmail-message': this._renderZMailMessageView.bind(this),
      memo: this._renderMemoView.bind(this),
      'memo-note': this._renderMemoNoteView.bind(this)
    };
    this.componentId = `agent-${device.id}`;
    console.log("AgentApplication constructor called with device:", device);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "cyberpunk-agent",
      classes: ["cyberpunk-agent", "agent-application"],
      template: "modules/cyberpunk-agent/templates/agent-home.html",
      width: 400,
      height: 700,
      resizable: true,
      minimizable: true,
      title: "Cyberpunk Agent"
    });
  }

  /**
   * Get data for the template
   */
  async getData(options = {}) {
    const data = super.getData(options);

    // Get current time
    const now = new Date();
    const currentTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get or generate phone number for the device
    const unformattedPhoneNumber = await window.CyberpunkAgent?.instance?.getDevicePhoneNumber(this.device.id) || 'N/A';
    const phoneNumber = window.CyberpunkAgent?.instance?.formatPhoneNumberForDisplay(unformattedPhoneNumber) || 'N/A';

    // Get actor name from the device's owner
    const actor = this.device.ownerActorId ? game.actors.get(this.device.ownerActorId) : null;
    const actorName = actor ? actor.name : 'Unknown Actor';

    let templateData = {
      ...data,
      device: {
        ...this.device,
        phoneNumber: phoneNumber,
        actorName: actorName
      },
      currentTime: currentTime,
      currentView: this.currentView,
      currentContact: this.currentContact
    };

    // Add view-specific data
    if (this.currentView === 'chat7') {
      // Get contacts for the device
      const contacts = window.CyberpunkAgent?.instance?.getContactsForDevice(this.device.id) || [];

      // Add unread counts and mute status to contacts
      const contactsWithData = contacts.map(contactDeviceId => {
        // Get contact device data
        const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactDeviceId);
        if (!contactDevice) {
          console.warn(`Cyberpunk Agent | Contact device ${contactDeviceId} not found`);
          return null;
        }

        // Force recalculation of unread count by clearing cache first
        if (window.CyberpunkAgent?.instance) {
          const conversationKey = window.CyberpunkAgent.instance._getDeviceConversationKey(this.device.id, contactDeviceId);
          window.CyberpunkAgent.instance.unreadCounts.delete(conversationKey);
        }

        const unreadCount = window.CyberpunkAgent?.instance?.getUnreadCountForDevices(this.device.id, contactDeviceId) || 0;
        const isMuted = window.CyberpunkAgent?.instance?.isContactMutedForDevice(this.device.id, contactDeviceId) || false;

        // Get the latest message timestamp for this conversation
        let latestMessageTimestamp = 0;
        try {
          const messages = window.CyberpunkAgent?.instance?.getMessagesForDeviceConversation(this.device.id, contactDeviceId) || [];
          if (messages.length > 0) {
            // Find the most recent message
            const latestMessage = messages.reduce((latest, current) =>
              current.timestamp > latest.timestamp ? current : latest
            );
            latestMessageTimestamp = latestMessage.timestamp;
          }
        } catch (error) {
          console.warn(`Cyberpunk Agent | Error getting latest message timestamp for contact ${contactDeviceId}:`, error);
        }

        // Use proper owner name and avatar for contact display
        const contactOwnerName = window.CyberpunkAgent?.instance?.getDeviceOwnerName(contactDeviceId) || contactDevice.deviceName || `Device ${contactDeviceId}`;

        // Get actor avatar if available, fallback to device avatar
        let contactAvatar = contactDevice.img || 'icons/svg/mystery-man.svg';
        if (contactDevice.ownerActorId) {
          const actor = game.actors.get(contactDevice.ownerActorId);
          if (actor && actor.img) {
            contactAvatar = actor.img;
          }
        }

        return {
          id: contactDeviceId,
          name: contactOwnerName,
          img: contactAvatar,
          unreadCount: unreadCount > 0 ? unreadCount : null,
          isMuted: isMuted,
          latestMessageTimestamp: latestMessageTimestamp
        };
      }).filter(contact => contact !== null); // Remove null contacts

      // Sort contacts by latest message timestamp (most recent first)
      // Contacts with no messages will have timestamp 0 and appear at the bottom
      contactsWithData.sort((a, b) => b.latestMessageTimestamp - a.latestMessageTimestamp);

      templateData.contacts = contactsWithData;
      templateData.isGM = game.user.isGM;

      console.log("AgentApplication | Template data for Chat7:", {
        contactsCount: contactsWithData.length,
        contacts: contactsWithData
      });
    } else if (this.currentView === 'conversation' && this.currentContact && this.currentContact.id) {
      // Ensure contact data is fresh and complete
      const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(this.currentContact.id);
      if (contactDevice) {
        // Get proper owner name and avatar for chat conversation header
        const contactOwnerName = window.CyberpunkAgent?.instance?.getDeviceOwnerName(this.currentContact.id) || contactDevice.deviceName || this.currentContact.name || `Device ${this.currentContact.id}`;

        // Get actor avatar if available, fallback to device avatar
        let contactAvatar = contactDevice.img || this.currentContact.img || 'icons/svg/mystery-man.svg';
        if (contactDevice.ownerActorId) {
          const actor = game.actors.get(contactDevice.ownerActorId);
          if (actor && actor.img) {
            contactAvatar = actor.img;
          }
        }

        // Update current contact with fresh data
        this.currentContact = {
          id: this.currentContact.id,
          name: contactOwnerName,
          img: contactAvatar,
          deviceName: contactDevice.deviceName,
          ownerName: contactDevice.ownerName,
          isVirtual: contactDevice.isVirtual || false
        };
      }

      // Get messages for the conversation with enhanced error handling
      let messages = [];
      try {
        messages = window.CyberpunkAgent?.instance?.getMessagesForDeviceConversation(this.device.id, this.currentContact.id) || [];

        // If no messages found, try alternative conversation keys (for backwards compatibility)
        if (messages.length === 0) {
          console.log("AgentApplication | No messages found with device conversation key, checking alternative keys...");

          // Try actor-based conversation key as fallback
          const actorConversationKey = window.CyberpunkAgent?.instance?._getConversationKey(this.device.ownerActorId, this.currentContact.ownerActorId);
          if (actorConversationKey) {
            const actorMessages = window.CyberpunkAgent?.instance?.messages?.get(actorConversationKey) || [];
            if (actorMessages.length > 0) {
              console.log(`AgentApplication | Found ${actorMessages.length} messages using actor conversation key`);
              messages = actorMessages;
            }
          }
        }
      } catch (error) {
        console.error("AgentApplication | Error getting messages for conversation:", error);
        messages = [];
      }

      // Format messages for the Handlebars template with deduplication
      const messageIds = new Set();
      const formattedMessages = messages
        .filter(message => {
          // Deduplicate messages by ID
          if (messageIds.has(message.id)) {
            return false;
          }
          messageIds.add(message.id);
          return true;
        })
        .map(message => {
          const messageText = message.text || message.message; // Use 'text' property, fallback to 'message' for compatibility
          const isOwn = message.senderId === this.device.id;

          return {
            ...message,
            text: messageText, // Keep original text for data attributes
            formattedText: window.CyberpunkAgent?.instance?.parseZMailLinks(messageText, isOwn) || messageText, // Parse ZMail links for display with ownership context
            isOwn: isOwn,
            time: message.time || new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

      templateData.messages = formattedMessages;
      templateData.contact = this.currentContact;

      console.log("AgentApplication | Template data for conversation:", {
        messagesCount: formattedMessages.length,
        contact: this.currentContact.name,
        contactData: this.currentContact,
        deviceId: this.device.id,
        contactId: this.currentContact.id
      });
    } else if (this.currentView === 'add-contact') {
      // Add add-contact-specific data
      templateData.searchResult = this.addContactState?.searchResult || null;
      templateData.errorMessage = this.addContactState?.errorMessage || null;
      templateData.successMessage = this.addContactState?.successMessage || null;
      templateData.isSearching = this.addContactState?.isSearching || false;
      templateData.phoneNumber = this.addContactState?.phoneNumber || '';

      console.log("AgentApplication | Template data for add-contact:", {
        searchResult: templateData.searchResult,
        errorMessage: templateData.errorMessage,
        successMessage: templateData.successMessage,
        isSearching: templateData.isSearching,
        phoneNumber: templateData.phoneNumber
      });
    } else if (this.currentView === 'zmail') {
      // Get ZMail messages for the device
      const zmailMessages = window.CyberpunkAgent?.instance?.getZMailMessages(this.device.id) || [];

      // Format messages for template
      const formattedMessages = zmailMessages.map(message => ({
        ...message,
        preview: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content
      })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

      templateData.messages = formattedMessages;

      console.log("AgentApplication | Template data for ZMail:", {
        messagesCount: formattedMessages.length,
        deviceId: this.device.id
      });
    } else if (this.currentView === 'zmail-message' && this.currentZMailMessage) {
      // Format the current ZMail message for display
      templateData.message = {
        ...this.currentZMailMessage,
        content: this.currentZMailMessage.content.replace(/\n/g, '<br>') // Convert line breaks to HTML
      };

      console.log("AgentApplication | Template data for ZMail message:", {
        messageId: this.currentZMailMessage.id,
        subject: this.currentZMailMessage.subject
      });
    } else if (this.currentView === 'memo') {
      // Get Memo notes for the device
      const memoNotes = window.CyberpunkAgent?.instance?.getMemoNotes(this.device.id) || [];

      // Format notes for template
      const formattedNotes = memoNotes.map(note => ({
        ...note,
        preview: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
        time: new Date(note.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

      templateData.notes = formattedNotes;

      console.log("AgentApplication | Template data for Memo:", {
        notesCount: formattedNotes.length,
        deviceId: this.device.id
      });
    } else if (this.currentView === 'memo-note' && this.currentMemoNote) {
      // Format the current Memo note for display
      templateData.note = {
        ...this.currentMemoNote,
        createdTime: new Date(this.currentMemoNote.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        modifiedTime: this.currentMemoNote.modifiedTimestamp ? new Date(this.currentMemoNote.modifiedTimestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null
      };

      console.log("AgentApplication | Template data for Memo note:", {
        noteId: this.currentMemoNote.id,
        title: this.currentMemoNote.title
      });
    }

    return templateData;
  }

  /**
   * Render the application with the current view
   */
  render(force = false, options = {}) {
    // Prevent infinite loops during rendering, but allow force renders for navigation
    if (this._isRendering && !force) {
      console.log("AgentApplication | Already rendering, skipping render call (use force=true to override)");
      return this;
    }

    this._isRendering = true;

    console.log(`AgentApplication | Rendering with view: ${this.currentView}, template: ${this.options.template}`);

    try {
      const result = super.render(force, options);

      console.log(`AgentApplication | Render completed for view: ${this.currentView}`);

      // After rendering, update the content based on current view
      this._updateViewContent();

      // Register with UI Controller for real-time updates
      this._registerWithUIController();

      return result;
    } finally {
      // Reset the flag after a short delay
      setTimeout(() => {
        this._isRendering = false;
      }, 50);
    }
  }

  /**
   * Register this application with the UI Controller
   */
  _registerWithUIController() {
    if (window.CyberpunkAgentUIController) {
      // Create component-specific IDs based on current view
      const componentIds = this._getComponentIds();

      componentIds.forEach(componentId => {
        const updateCallback = (component) => {
          console.log(`AgentApplication | UI Controller update callback for: ${componentId}`);
          this._handleUIControllerUpdate(componentId);
        };

        window.CyberpunkAgentUIController.registerComponent(componentId, this, updateCallback);
        console.log(`AgentApplication | Registered with UI Controller: ${componentId}`);
      });
    }
  }

  /**
   * Get component IDs for the current view
   */
  _getComponentIds() {
    const componentIds = [];

    if (this.currentView === 'conversation' && this.currentContact && this.currentContact.id) {
      componentIds.push(`agent-conversation-${this.device.id}-${this.currentContact.id}`);
    } else if (this.currentView === 'chat7') {
      componentIds.push(`agent-chat7-${this.device.id}`);
    }

    return componentIds;
  }

  /**
   * Handle UI Controller update
   */
  _handleUIControllerUpdate(componentId) {
    console.log(`AgentApplication | Handling UI Controller update for: ${componentId}`);

    // Skip updates during navigation to prevent conflicts
    if (this._navigationInProgress) {
      console.log("AgentApplication | Skipping UI Controller update during navigation");
      return;
    }

    // Check if the application is actually rendered and visible
    if (!this.rendered || !this.element || !this.element.is(':visible')) {
      console.log("AgentApplication | Application not rendered or visible, skipping UI Controller update");
      return;
    }

    if (componentId.includes('conversation')) {
      // Defensive check for currentContact
      if (!this.currentContact || !this.currentContact.id) {
        console.warn("AgentApplication | currentContact is null or undefined, skipping conversation update");
        return;
      }

      // Prevent infinite loops
      if (this._isUpdating) {
        console.log("AgentApplication | Already updating, skipping UI Controller update");
        return;
      }

      // Simple re-render without forcing
      this.render(true);
    } else if (componentId.includes('chat7')) {
      // Update Chat7 view with force re-render to ensure mute status is updated
      console.log("AgentApplication | UI Controller update for Chat7, forcing re-render");
      this.render(true);
    }
  }

  /**
   * Unregister from UI Controller when closing
   */
  close(options = {}) {
    // Clear active conversation when closing
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.clearActiveConversation(game.user.id);
      console.log(`AgentApplication | Cleared active conversation on close for user ${game.user.id}`);
    }

    // Remove event listeners to prevent memory leaks and unwanted behavior
    if (this._chat7UpdateHandler) {
      document.removeEventListener('cyberpunk-agent-update', this._chat7UpdateHandler);
      this._chat7UpdateHandler = null;
      console.log("AgentApplication | Removed Chat7 event listener");
    }

    if (this._conversationUpdateHandler) {
      document.removeEventListener('cyberpunk-agent-update', this._conversationUpdateHandler);
      this._conversationUpdateHandler = null;
      console.log("AgentApplication | Removed conversation event listener");
    }

    // Unregister from UI Controller
    if (window.CyberpunkAgentUIController) {
      const componentIds = this._getComponentIds();
      componentIds.forEach(componentId => {
        window.CyberpunkAgentUIController.unregisterComponent(componentId);
        console.log(`AgentApplication | Unregistered from UI Controller: ${componentId}`);
      });
    }

    return super.close(options);
  }

  /**
   * Update the view content based on current view
   */
  _updateViewContent() {
    if (this.views[this.currentView]) {
      this.views[this.currentView]();
    }
  }

  /**
   * Navigate to a different view
   */
  async navigateTo(view, contact = null) {
    console.log(`AgentApplication | Navigating to view: ${view}`, contact);

    // Register or clear active conversation based on navigation
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      if (view === 'conversation' && contact && contact.id) {
        // Register active conversation
        window.CyberpunkAgent.instance.registerActiveConversation(
          game.user.id,
          this.device.id,
          contact.id
        );
        console.log(`AgentApplication | Registered active conversation: ${this.device.id} -> ${contact.id}`);

        // Sync with server before opening conversation to ensure all messages are up to date
        console.log(`AgentApplication | Syncing device ${this.device.id} with server before opening conversation`);
        try {
          await window.CyberpunkAgent.instance.syncMessagesWithServer(this.device.id);
          console.log(`AgentApplication | Server sync completed for device ${this.device.id}`);
        } catch (error) {
          console.error(`AgentApplication | Error syncing with server:`, error);
        }
      } else {
        // Clear active conversation when navigating away from conversation view
        window.CyberpunkAgent.instance.clearActiveConversation(game.user.id);
        console.log(`AgentApplication | Cleared active conversation for user ${game.user.id}`);
      }
    }

    // Reset data loading flag when changing views
    if (this.currentView !== view) {
      this._dataLoaded = false;
    }

    this.currentView = view;
    this.currentContact = contact;

    // Update the template based on view
    this._updateTemplate();

    // Temporarily disable UI Controller updates during navigation to prevent conflicts
    this._navigationInProgress = true;

    // Re-render with force to ensure navigation completes
    this.render(true);

    // Re-enable UI Controller after a short delay and force final render
    setTimeout(() => {
      this._navigationInProgress = false;

      // Force one final render to ensure the view actually displays
      console.log(`AgentApplication | Final render after navigation to ${view}`);
      this.render(true);
    }, 100);
  }

  /**
   * Update template based on current view
   */
  _updateTemplate() {
    let templatePath = "modules/cyberpunk-agent/templates/agent-home.html";

    switch (this.currentView) {
      case 'chat7':
        templatePath = "modules/cyberpunk-agent/templates/chat7.html";
        break;
      case 'conversation':
        templatePath = "modules/cyberpunk-agent/templates/chat-conversation.html";
        break;
      case 'add-contact':
        templatePath = "modules/cyberpunk-agent/templates/add-contact.html";
        break;
      case 'zmail':
        templatePath = "modules/cyberpunk-agent/templates/zmail.html";
        break;
      case 'zmail-message':
        templatePath = "modules/cyberpunk-agent/templates/zmail-message.html";
        break;
      case 'memo':
        templatePath = "modules/cyberpunk-agent/templates/memo.html";
        break;
      case 'memo-note':
        templatePath = "modules/cyberpunk-agent/templates/memo-note.html";
        break;
      default:
        templatePath = "modules/cyberpunk-agent/templates/agent-home.html";
    }

    console.log(`AgentApplication | Updating template for view '${this.currentView}' to: ${templatePath}`);
    this.options.template = templatePath;
  }

  /**
   * Render home view
   */
  _renderHomeView() {
    // Home view is handled by the template
    console.log("AgentApplication | Rendering home view");
  }

  /**
   * Render Chat7 view
   */
  _renderChat7View() {
    console.log("AgentApplication | Rendering Chat7 view for device:", this.device.name, this.device.id);

    // The contacts are now rendered by the template via getData()
    // This method is called after the template is rendered, so we just need to setup listeners

    // Setup real-time listener for Chat7
    this._setupChat7RealtimeListener();
  }

  /**
   * Render conversation view
   */
  async _renderConversationView() {
    console.log("AgentApplication | Rendering conversation view for contact:", this.currentContact);

    if (!this.currentContact) {
      console.error("AgentApplication | No contact specified for conversation view");
      return;
    }

    // Load fresh data only once to prevent loops
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance && !this._dataLoaded) {
      console.log("AgentApplication | Loading fresh data for conversation view (one-time)");
      this._dataLoaded = true;

      // Load messages to ensure conversation is current
      await window.CyberpunkAgent.instance.loadMessages();

      console.log("AgentApplication | Data loading completed for conversation view");
    }

    // Refresh contact data from devices map
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(this.currentContact.id);
    if (contactDevice) {
      this.currentContact = {
        id: this.currentContact.id,
        name: contactDevice.deviceName || contactDevice.ownerName || this.currentContact.name,
        img: contactDevice.img || this.currentContact.img || 'icons/svg/mystery-man.svg',
        deviceName: contactDevice.deviceName,
        ownerName: contactDevice.ownerName
      };
      console.log("AgentApplication | Refreshed contact data:", this.currentContact);
    }

    // Mark conversation as read when opening (only if not already processing)
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance && !this._markingAsRead) {
      this._markingAsRead = true;
      window.CyberpunkAgent.instance.markDeviceConversationAsRead(this.device.id, this.currentContact.id);

      // Reset flag after a delay
      setTimeout(() => {
        this._markingAsRead = false;
      }, 1000);
    }

    // Setup real-time listener for conversation
    this._setupConversationRealtimeListener();

    console.log("AgentApplication | Conversation view setup completed");
  }

  /**
   * Render add contact view
   */
  _renderAddContactView() {
    console.log("AgentApplication | Rendering add contact view for device:", this.device.id);

    // Initialize add contact state only if it doesn't exist
    if (!this.addContactState) {
      this.addContactState = {
        phoneNumber: '',
        searchResult: null,
        errorMessage: null,
        successMessage: null,
        isSearching: false
      };
    }

    console.log("AgentApplication | Add contact view setup completed");
  }

  /**
   * Render ZMail view
   */
  _renderZMailView() {
    console.log("AgentApplication | Rendering ZMail view for device:", this.device.id);
    console.log("AgentApplication | ZMail view setup completed");
  }

  /**
   * Render ZMail message view
   */
  _renderZMailMessageView() {
    console.log("AgentApplication | Rendering ZMail message view for message:", this.currentZMailMessage?.id);
    console.log("AgentApplication | ZMail message view setup completed");
  }

  /**
   * Render Memo view
   */
  _renderMemoView() {
    console.log("AgentApplication | Rendering Memo view for device:", this.device.id);
    console.log("AgentApplication | Memo view setup completed");
  }

  /**
   * Render Memo note view
   */
  _renderMemoNoteView() {
    console.log("AgentApplication | Rendering Memo note view for note:", this.currentMemoNote?.id);
    console.log("AgentApplication | Memo note view setup completed");
  }

  /**
   * Force re-render conversation view with updated data
   */
  _forceRenderConversationView() {
    console.log("AgentApplication | Force re-rendering conversation view");

    if (!this.currentContact) {
      console.error("AgentApplication | No contact specified for conversation view");
      return;
    }

    // Prevent infinite loops by checking if we're already updating
    if (this._isUpdating) {
      console.log("AgentApplication | Already updating, skipping force re-render");
      return;
    }

    this._isUpdating = true;

    try {
      // Force a complete re-render of the conversation view
      this.render(true);
    } finally {
      // Reset the flag after a short delay to allow for completion
      setTimeout(() => {
        this._isUpdating = false;
      }, 100);
    }
  }

  /**
   * Setup real-time listener for Chat7
   */
  _setupChat7RealtimeListener() {
    // Remove existing listener
    document.removeEventListener('cyberpunk-agent-update', this._chat7UpdateHandler);

    // Create new handler
    this._chat7UpdateHandler = (event) => {
      const { type, senderId, receiverId, message, contactId, muteStatus } = event.detail;

      if (type === 'messageUpdate' || type === 'contactUpdate' || type === 'contactMuteToggle') {
        console.log("AgentApplication | Chat7 received update:", type);

        // Skip updates during navigation to prevent conflicts
        if (this._navigationInProgress) {
          console.log("AgentApplication | Skipping Chat7 update during navigation");
          return;
        }

        // Check if the application is actually rendered and visible
        if (!this.rendered || !this.element || !this.element.is(':visible')) {
          console.log("AgentApplication | Application not rendered or visible, skipping update");
          return;
        }

        // Only update if we're in Chat7 view
        if (this.currentView !== 'chat7') {
          console.log("AgentApplication | Not in Chat7 view, skipping update");
          return;
        }

        // Prevent infinite loops
        if (this._isUpdating) {
          console.log("AgentApplication | Already updating, skipping Chat7 update");
          return;
        }

        // For message updates, we need to force a complete re-render to refresh unread counts
        if (type === 'messageUpdate') {
          console.log("AgentApplication | Message update detected, forcing re-render for unread count update");
          this.render(true);
        }
        // For contact updates (new contacts added), we need to force a complete re-render to show new contacts
        else if (type === 'contactUpdate') {
          console.log("AgentApplication | Contact update detected, forcing re-render to show new contacts");
          this.render(true);
        }
        // For mute toggle, we need to force a complete re-render to show the mute status
        else if (type === 'contactMuteToggle') {
          console.log("AgentApplication | Contact mute toggle detected, forcing re-render");
          this.render(true);
        }
      }
    };

    // Add listener
    document.addEventListener('cyberpunk-agent-update', this._chat7UpdateHandler);
  }

  /**
   * Setup real-time listener for conversation
   */
  _setupConversationRealtimeListener() {
    // Remove existing listener
    document.removeEventListener('cyberpunk-agent-update', this._conversationUpdateHandler);

    // Create new handler
    this._conversationUpdateHandler = (event) => {
      const { type, senderId, receiverId, message } = event.detail;

      // Defensive check for currentContact
      if (!this.currentContact || !this.currentContact.id) {
        console.warn("AgentApplication | currentContact is null or undefined, skipping conversation update");
        return;
      }

      // Check if the application is actually rendered and visible
      if (!this.rendered || !this.element || !this.element.is(':visible')) {
        console.log("AgentApplication | Application not rendered or visible, skipping conversation update");
        return;
      }

      if (type === 'messageUpdate' &&
        ((senderId === this.device.id && receiverId === this.currentContact.id) ||
          (senderId === this.currentContact.id && receiverId === this.device.id))) {
        console.log("AgentApplication | Conversation received update");

        // Prevent infinite loops
        if (this._isUpdating) {
          console.log("AgentApplication | Already updating, skipping conversation update");
          return;
        }

        // Simple re-render
        this.render(true);
      }
    };

    // Add listener
    document.addEventListener('cyberpunk-agent-update', this._conversationUpdateHandler);
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners based on current view
    switch (this.currentView) {
      case 'home':
        this._activateHomeListeners(html);
        break;
      case 'chat7':
        this._activateChat7Listeners(html);
        break;
      case 'conversation':
        this._activateConversationListeners(html);
        break;
      case 'add-contact':
        this._activateAddContactListeners(html);
        break;
      case 'zmail':
        this._activateZMailListeners(html);
        break;
      case 'zmail-message':
        this._activateZMailMessageListeners(html);
        break;
      case 'memo':
        this._activateMemoListeners(html);
        break;
      case 'memo-note':
        this._activateMemoNoteListeners(html);
        break;
    }
  }

  /**
   * Activate home view listeners
   */
  _activateHomeListeners(html) {
    html.find('.cp-app-icon[data-app="chat7"]').click(this._onChat7Click.bind(this));
    html.find('.cp-app-icon[data-app="zmail"]').click(this._onZMailClick.bind(this));
    html.find('.cp-app-icon[data-app="memo"]').click(this._onMemoClick.bind(this));
    html.find('.cp-phone-number[data-action="copy-phone-number"]').click(this._onPhoneNumberClick.bind(this));

    // Add context menu for home screen
    html.find('[data-action="home-context-menu"]').on('contextmenu', this._onHomeContextMenu.bind(this));
  }

  /**
 * Activate Chat7 listeners
 */
  _activateChat7Listeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));

    // The template renders contact items, so we need to use event delegation
    html.find('.cp-contact-item').click(this._onContactChatClick.bind(this));
    html.find('.cp-contact-item').on('contextmenu', this._onContactContextMenu.bind(this));

    // Add context menu for contacts list background (only when not clicking on contacts)
    html.find('.cp-contacts-container').on('contextmenu', (event) => {
      // Only show background context menu if we're not clicking on a contact item
      if (!$(event.target).closest('.cp-contact-item').length) {
        this._onContactsBackgroundContextMenu(event);
      }
    });

    // Setup document click for context menu
    $(document).off('click.cyberpunk-agent-context').on('click.cyberpunk-agent-context', this._onDocumentClick.bind(this));
  }

  /**
   * Activate conversation listeners
   */
  _activateConversationListeners(html) {
    console.log("AgentApplication | Activating conversation listeners");

    // Back button
    const backButton = html.find('.cp-back-button');
    console.log("AgentApplication | Found back button:", backButton.length);
    backButton.click(this._onBackClick.bind(this));

    // Send message button
    const sendButton = html.find('.cp-send-message');
    console.log("AgentApplication | Found send button:", sendButton.length);
    sendButton.click(this._onSendMessage.bind(this));

    // Message input
    const messageInput = html.find('.cp-message-input');
    console.log("AgentApplication | Found message input:", messageInput.length);
    messageInput.keypress(this._onMessageInputKeypress.bind(this));

    // Add input event for auto-resizing textarea
    messageInput.on('input', (event) => {
      this._autoResizeTextarea(event.target);
    });

    // Message context menu
    const messageElements = html.find('.cp-message[data-action="message-context-menu"]');
    console.log("AgentApplication | Found message elements:", messageElements.length);
    messageElements.contextmenu(this._onMessageContextMenu.bind(this));

    // ZMail link clicks
    const zmailLinks = html.find('.cp-zmail-link[data-action="open-zmail-link"]');
    console.log("AgentApplication | Found ZMail links:", zmailLinks.length);
    zmailLinks.click(this._onZMailLinkClick.bind(this));

    console.log("AgentApplication | Conversation listeners activated successfully");
  }

  /**
   * Activate add contact listeners
   */
  _activateAddContactListeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-phone-input').on('input', this._onPhoneInput.bind(this));
    html.find('.cp-phone-input').on('keypress', this._onPhoneKeypress.bind(this));
    html.find('.cp-search-btn').click(this._onSearchClick.bind(this));
    html.find('.cp-search-result').click(this._onAddContactClick.bind(this));

    // Apply mask to phone input if it has a value
    const phoneInput = html.find('.cp-phone-input');
    if (phoneInput.val() && this.addContactState?.phoneNumber) {
      const maskedValue = this._applyPhoneMask(this.addContactState.phoneNumber);
      phoneInput.val(maskedValue);
    }
  }

  /**
   * Handle Chat7 app click
   */
  _onChat7Click(event) {
    event.preventDefault();
    console.log("Chat7 app clicked for device:", this.device.name);

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to Chat7 view
    this.navigateTo('chat7');
  }

  /**
   * Handle ZMail app click
   */
  _onZMailClick(event) {
    event.preventDefault();
    console.log("ZMail app clicked for device:", this.device.name);

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to ZMail view
    this.navigateTo('zmail');
  }

  /**
   * Handle Memo app click
   */
  _onMemoClick(event) {
    event.preventDefault();
    console.log("Memo app clicked for device:", this.device.name);

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to Memo view
    this.navigateTo('memo');
  }

  /**
 * Handle phone number click to copy to clipboard
 */
  _onPhoneNumberClick(event) {
    event.preventDefault();
    console.log("Phone number clicked for device:", this.device.name);

    // Get the phone number from the DOM element
    const phoneElement = $(event.currentTarget);
    const phoneNumberSpan = phoneElement.find('span');
    const phoneNumber = phoneNumberSpan.text().trim();

    if (!phoneNumber || phoneNumber === 'N/A') {
      ui.notifications.warn("Número de telefone não disponível");
      return;
    }

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(phoneNumber).then(() => {
        console.log("Cyberpunk Agent | Phone number copied to clipboard:", phoneNumber);
        ui.notifications.info(`Número ${phoneNumber} copiado para a área de transferência!`);

        // Add visual feedback
        phoneElement.addClass('cp-copied');

        // Remove the copied class after animation
        setTimeout(() => {
          phoneElement.removeClass('cp-copied');
        }, 1000);

      }).catch(err => {
        console.error("Cyberpunk Agent | Error copying phone number to clipboard:", err);
        ui.notifications.error("Erro ao copiar número de telefone!");
      });
    } catch (error) {
      console.error("Cyberpunk Agent | Error copying phone number:", error);
      ui.notifications.error("Erro ao copiar número de telefone!");
    }
  }

  /**
   * Handle home screen context menu
   */
  _onHomeContextMenu(event) {
    event.preventDefault();
    console.log("Home context menu requested");

    // Remove any existing context menu
    $('.cp-context-menu').remove();

    const contextMenu = $(`
      <div class="cp-context-menu" style="position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;">
        <button class="cp-context-menu-item" data-action="sync-device">
          <i class="fas fa-sync-alt"></i>Sincronizar com Servidor
        </button>
        <button class="cp-context-menu-item" data-action="device-info">
          <i class="fas fa-info-circle"></i>Informações do Dispositivo
        </button>
      </div>
    `);

    // Add event listeners with menu removal
    contextMenu.find('[data-action="sync-device"]').click(async () => {
      $('.cp-context-menu').remove();
      await this._performDeviceSync();
    });

    contextMenu.find('[data-action="device-info"]').click(() => {
      $('.cp-context-menu').remove();
      this._showDeviceInfo();
    });

    // Append to body and handle click outside
    $('body').append(contextMenu);

    // Remove context menu when clicking outside
    $(document).one('click', () => {
      $('.cp-context-menu').remove();
    });

    // Prevent the context menu from being removed immediately
    contextMenu.on('click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Perform device sync with server and refresh UI
   */
  async _performDeviceSync() {
    try {
      console.log("Cyberpunk Agent | Performing device sync from home context menu");

      // Log sync start (console only)
      console.log("Cyberpunk Agent | Sincronizando dispositivo com servidor...");

      // Perform comprehensive sync
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        const success = await window.CyberpunkAgent.instance.syncMessagesWithServer(this.device.id, false); // showProgress = false

        if (success) {
          // Refresh the UI to show updated data
          console.log("Cyberpunk Agent | Sync successful, refreshing UI");
          this.render(true);

          // Update any open interfaces
          window.CyberpunkAgent.instance._updateChatInterfacesImmediately();

          console.log("Cyberpunk Agent | Sincronização concluída com sucesso!");
        } else {
          console.warn("Cyberpunk Agent | Sincronização concluída com avisos.");
        }
      } else {
        ui.notifications.error("Sistema não disponível para sincronização");
      }
    } catch (error) {
      console.error("Cyberpunk Agent | Error in device sync:", error);
      ui.notifications.error("Erro na sincronização: " + error.message);
    }
  }

  /**
   * Show device information dialog
   */
  _showDeviceInfo() {
    try {
      console.log("Cyberpunk Agent | Showing device info");

      // Get device information
      const deviceInfo = {
        id: this.device.id,
        name: this.device.deviceName || 'Agent',
        owner: this.device.ownerName || 'Unknown',
        phoneNumber: this.device.phoneNumber || 'N/A',
        contacts: this.device.contacts ? this.device.contacts.length : 0,
        isVirtual: this.device.isVirtual || false
      };

      // Get message count
      let messageCount = 0;
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        const allMessages = window.CyberpunkAgent.instance.messages;
        for (const [conversationKey, messages] of allMessages) {
          if (conversationKey.includes(this.device.id)) {
            messageCount += messages.length;
          }
        }
      }

      const infoDialog = new Dialog({
        title: "Informações do Dispositivo",
        content: `
          <div style="font-family: 'Rajdhani', sans-serif; line-height: 1.6;">
            <h3 style="color: #ff6600; margin-bottom: 15px;">📱 ${deviceInfo.name}</h3>
            <p><strong>ID:</strong> ${deviceInfo.id}</p>
            <p><strong>Proprietário:</strong> ${deviceInfo.owner}</p>
            <p><strong>Telefone:</strong> ${deviceInfo.phoneNumber}</p>
            <p><strong>Contatos:</strong> ${deviceInfo.contacts}</p>
            <p><strong>Mensagens:</strong> ${messageCount}</p>
            <p><strong>Tipo:</strong> ${deviceInfo.isVirtual ? 'Virtual' : 'Físico'}</p>
          </div>
        `,
        buttons: {
          close: {
            label: "Fechar",
            callback: () => console.log("Device info dialog closed")
          }
        },
        default: "close"
      });

      infoDialog.render(true);
    } catch (error) {
      console.error("Cyberpunk Agent | Error showing device info:", error);
      ui.notifications.error("Erro ao exibir informações do dispositivo");
    }
  }

  /**
   * Handle back button click
   */
  _onBackClick(event) {
    event.preventDefault();
    console.log("Back button clicked");

    // Play closing sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('closing-window');
    }

    // Navigate back based on current view
    switch (this.currentView) {
      case 'chat7':
        this.navigateTo('home');
        break;
      case 'conversation':
        this.navigateTo('chat7');
        break;
      case 'add-contact':
        this.navigateTo('chat7');
        break;
      case 'zmail':
        this.navigateTo('home');
        break;
      case 'zmail-message':
        this.navigateTo('zmail');
        break;
      case 'memo':
        this.navigateTo('home');
        break;
      case 'memo-note':
        this.navigateTo('memo');
        break;
      default:
        this.navigateTo('home');
    }
  }

  /**
   * Handle contact chat button click
   */
  async _onContactChatClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const contactId = event.currentTarget.dataset.contactId;
    console.log("AgentApplication | Contact chat clicked for contact:", contactId);
    console.log("AgentApplication | Current view before navigation:", this.currentView);
    console.log("AgentApplication | Current contact before navigation:", this.currentContact);

    // Ensure device data is fresh before opening conversation
    if (window.CyberpunkAgent?.instance) {
      window.CyberpunkAgent.instance.loadDeviceData();
    }

    // Get contact device data directly from the devices map
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactId);

    if (!contactDevice) {
      console.error(`Cyberpunk Agent | Contact device ${contactId} not found in devices map`);
      console.error(`Available devices:`, Array.from(window.CyberpunkAgent?.instance?.devices?.keys() || []));
      ui.notifications.error("Contato não encontrado!");
      return;
    }

    // Create enhanced contact object with all required fields
    const contact = {
      id: contactId,
      name: contactDevice.deviceName || contactDevice.ownerName || `Device ${contactId}`,
      img: contactDevice.img || 'icons/svg/mystery-man.svg',
      deviceName: contactDevice.deviceName,
      ownerName: contactDevice.ownerName,
      isVirtual: contactDevice.isVirtual || false
    };

    console.log("Cyberpunk Agent | Enhanced contact data for conversation:", contact);

    // Ensure messages are loaded for this conversation
    if (window.CyberpunkAgent?.instance) {
      try {
        await window.CyberpunkAgent.instance.syncMessagesWithServer(this.device.id);
        console.log("Cyberpunk Agent | Messages synced before opening conversation");
      } catch (error) {
        console.warn("Cyberpunk Agent | Error syncing messages before conversation:", error);
      }
    }

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to conversation view with enhanced contact data
    console.log("AgentApplication | About to navigate to conversation with contact:", contact);

    try {
      await this.navigateTo('conversation', contact);
      console.log("AgentApplication | Navigation to conversation completed successfully");
      console.log("AgentApplication | Current view after navigation:", this.currentView);
      console.log("AgentApplication | Current contact after navigation:", this.currentContact);
    } catch (error) {
      console.error("AgentApplication | Error during navigation to conversation:", error);
      ui.notifications.error("Erro ao abrir conversa: " + error.message);
    }
  }

  /**
   * Handle contacts background context menu
   */
  _onContactsBackgroundContextMenu(event) {
    event.preventDefault();
    console.log("Contacts background context menu for device:", this.device.id);

    // Show context menu with add contact option
    this._showContactsBackgroundContextMenu(event);
  }

  /**
   * Handle contact context menu
   */
  _onContactContextMenu(event) {
    event.preventDefault();

    const contactId = event.currentTarget.dataset.contactId;
    console.log(`AgentApplication | Contact context menu triggered for contact: ${contactId}`);

    // Get contact device data directly from the devices map
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactId);

    if (!contactDevice) {
      console.error(`Cyberpunk Agent | Contact device ${contactId} not found in devices map`);
      ui.notifications.error("Contato não encontrado no sistema");
      return;
    }

    // Verify contact is actually in the device's contact list
    const contacts = window.CyberpunkAgent.instance.getContactsForDevice(this.device.id);
    if (!contacts.includes(contactId)) {
      console.warn(`AgentApplication | Contact ${contactId} not found in device ${this.device.id} contact list`);
      ui.notifications.error("Contato não está na sua lista de contatos");
      return;
    }

    // Create contact object with the required fields
    const contact = {
      id: contactId,
      name: contactDevice.deviceName || contactDevice.ownerName || `Device ${contactId}`,
      img: contactDevice.img || 'icons/svg/mystery-man.svg'
    };

    console.log(`AgentApplication | Showing context menu for contact: ${contact.name}`);
    this._showContextMenu(event, contact);
  }

  /**
   * Handle message context menu
   */
  _onMessageContextMenu(event) {
    event.preventDefault();

    const messageId = event.currentTarget.dataset.messageId;
    const messageText = event.currentTarget.dataset.messageText;
    const messageTime = event.currentTarget.dataset.messageTime;
    const messageElement = event.currentTarget;

    console.log("Message context menu for message:", messageId, messageText);

    // Check if this message belongs to the current user (isOwn)
    const isOwnMessage = messageElement.classList.contains('own');

    // Enhanced: Allow players to access context menu on incoming messages too (with restrictions)
    console.log(`Cyberpunk Agent | Message context menu: isOwnMessage=${isOwnMessage}, isGM=${game.user.isGM}`);

    this._showMessageContextMenu(event, messageId, messageText, messageTime, isOwnMessage);
  }

  /**
   * Show context menu for contact
   */
  _showContextMenu(event, contact) {
    // Remove any existing context menu
    $('.cp-context-menu').remove();

    const isMuted = window.CyberpunkAgent?.instance?.isContactMuted(this.device.id, contact.id) || false;
    const muteIcon = isMuted ? 'fa-volume-mute' : 'fa-volume-up';
    const muteText = isMuted ? 'Ativar Notificações' : 'Silenciar Contato';

    const contextMenu = $(`
      <div class="cp-context-menu" style="position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;">
        <button class="cp-context-menu-item" data-action="mute" data-contact-id="${contact.id}">
          <i class="fas ${muteIcon}"></i>${muteText}
        </button>
        <button class="cp-context-menu-item" data-action="mark-read" data-contact-id="${contact.id}">
          <i class="fas fa-check-double"></i>Marcar Todos como Lidos
        </button>
        <button class="cp-context-menu-item cp-context-menu-item-disabled" data-action="clear-history" data-contact-id="${contact.id}" disabled title="Coming Soon - This feature is under development">
          <i class="fas fa-trash"></i>Limpar Histórico
        </button>
        <button class="cp-context-menu-item" data-action="info" data-contact-id="${contact.id}">
          <i class="fas fa-info-circle"></i>Informações do Contato
        </button>
        <button class="cp-context-menu-item" data-action="delete-contact" data-contact-id="${contact.id}" style="color: #ff6b6b; border-top: 1px solid var(--cp-border);">
          <i class="fas fa-user-minus"></i>Remover Contato
        </button>
      </div>
    `);

    // Add event listeners with menu removal
    contextMenu.find('[data-action="mute"]').click(() => {
      this._toggleContactMute(contact.id);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="mark-read"]').click(() => {
      this._markAllMessagesAsRead(contact.id);
      $('.cp-context-menu').remove();
    });
    // Clear history is disabled - coming soon feature
    // contextMenu.find('[data-action="clear-history"]').click(() => {
    //   this._clearConversationHistory(contact.id);
    //   $('.cp-context-menu').remove();
    // });
    contextMenu.find('[data-action="info"]').click(() => {
      this._showContactInfo(contact.id);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="delete-contact"]').click(() => {
      this._deleteContact(contact.id);
      $('.cp-context-menu').remove();
    });

    $('body').append(contextMenu);
  }

  /**
   * Show context menu for message with enhanced permissions
   * @param {Event} event - The context menu event
   * @param {string} messageId - ID of the message
   * @param {string} messageText - Text content of the message
   * @param {string} messageTime - Time of the message
   * @param {boolean} isOwnMessage - Whether the message belongs to current user
   */
  _showMessageContextMenu(event, messageId, messageText, messageTime, isOwnMessage) {
    // Remove any existing context menu
    $('.cp-context-menu').remove();

    // Build context menu options based on permissions
    let menuItems = [];

    // Copy and Info are available to everyone
    menuItems.push(`
      <button class="cp-context-menu-item" data-action="copy-message" data-message-id="${messageId}">
        <i class="fas fa-copy"></i>Copiar Texto
      </button>
    `);

    menuItems.push(`
      <button class="cp-context-menu-item" data-action="message-info" data-message-id="${messageId}">
        <i class="fas fa-info-circle"></i>Informações da Mensagem
      </button>
    `);

    // Edit is available for GMs on any message, or for user's own messages
    if (game.user.isGM || isOwnMessage) {
      const editLabel = game.user.isGM && !isOwnMessage ? 'Editar Mensagem (GM)' : 'Editar Mensagem';
      menuItems.unshift(`
        <button class="cp-context-menu-item" data-action="edit-message" data-message-id="${messageId}">
          <i class="fas fa-edit"></i>${editLabel}
        </button>
      `);
    }

    // Delete is only available for GMs or for user's own messages
    if (game.user.isGM || isOwnMessage) {
      const deleteLabel = game.user.isGM && !isOwnMessage ? 'Deletar Mensagem (GM)' : 'Deletar Mensagem';
      menuItems.unshift(`
        <button class="cp-context-menu-item" data-action="delete-message" data-message-id="${messageId}">
          <i class="fas fa-trash"></i>${deleteLabel}
        </button>
      `);
    }

    const contextMenu = $(`
      <div class="cp-context-menu" style="position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;">
        ${menuItems.join('')}
      </div>
    `);

    // Add event listeners with menu removal
    contextMenu.find('[data-action="edit-message"]').click(() => {
      this._editMessage(messageId, messageText);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="delete-message"]').click(() => {
      this._deleteMessage(messageId);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="copy-message"]').click(() => {
      this._copyMessageText(messageText);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="message-info"]').click(() => {
      this._showMessageInfo(messageId, messageText, messageTime);
      $('.cp-context-menu').remove();
    });

    $('body').append(contextMenu);
  }

  /**
   * Show contacts background context menu
   */
  _showContactsBackgroundContextMenu(event) {
    // Remove any existing context menus
    $('.cp-context-menu').remove();

    const contextMenu = $(`
      <div class="cp-context-menu" style="position: fixed; z-index: 10000; background: var(--cp-bg-secondary); border: 1px solid var(--cp-border); border-radius: 8px; box-shadow: var(--cp-shadow-strong); padding: 8px 0; min-width: 200px;">
        <button class="cp-context-menu-item" data-action="add-contact">
          <i class="fas fa-user-plus"></i>Adicionar Contato
        </button>
      </div>
    `);

    // Position the context menu at the mouse position
    contextMenu.css({
      left: event.pageX,
      top: event.pageY
    });

    // Add event listener for add contact
    contextMenu.find('[data-action="add-contact"]').click(() => {
      this._openContactSearchModal();
      $('.cp-context-menu').remove();
    });

    $('body').append(contextMenu);
  }

  /**
   * Navigate to add contact page
   */
  _openContactSearchModal() {
    console.log("Navigating to add contact page for device:", this.device.id);

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to add contact page
    this.navigateTo('add-contact');
  }

  /**
   * Toggle contact mute
   */
  _toggleContactMute(contactId) {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      const newMuteStatus = window.CyberpunkAgent.instance.toggleContactMuteForDevice(this.device.id, contactId);

      console.log("AgentApplication | Contact mute toggled, forcing UI update");

      // Strategy 1: Use UI Controller if available
      if (window.CyberpunkAgentUIController) {
        const chat7ComponentId = `agent-chat7-${this.device.id}`;
        window.CyberpunkAgentUIController.markDirty(chat7ComponentId);
        console.log("AgentApplication | Marked Chat7 component as dirty via UI Controller");
      }

      // Strategy 2: Force immediate re-render
      this.render(true);

      // Strategy 3: Dispatch custom event for real-time updates
      document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
        detail: {
          timestamp: Date.now(),
          type: 'contactMuteToggle',
          actorId: this.device.id,
          contactId: contactId,
          muteStatus: newMuteStatus
        }
      }));

      // Show user feedback
      const contact = window.CyberpunkAgent.instance.getContactsForDevice(this.device.id).find(c => c.id === contactId);

      if (contact) {
        ui.notifications.info(`Contato ${contact.name} ${newMuteStatus ? 'mutado' : 'desmutado'}!`);
      }
    }
  }

  /**
   * Show contact info
   */
  async _showContactInfo(contactId) {
    if (!window.CyberpunkAgent?.instance) {
      ui.notifications.error("Sistema de agentes não disponível");
      return;
    }

    try {
      // Get contact device data
      const contactDevice = window.CyberpunkAgent.instance.devices.get(contactId);
      if (!contactDevice) {
        ui.notifications.error("Contato não encontrado");
        return;
      }

      // Get contact's phone number
      const phoneNumber = await window.CyberpunkAgent.instance.getDevicePhoneNumber(contactId);
      const formattedPhone = window.CyberpunkAgent.instance.formatPhoneNumberForDisplay(phoneNumber);

      // Get messages for this conversation
      const messages = window.CyberpunkAgent.instance.getMessagesForDeviceConversation(this.device.id, contactId) || [];

      // Calculate message statistics
      const totalMessages = messages.length;
      const sentMessages = messages.filter(msg => msg.senderId === this.device.id).length;
      const receivedMessages = messages.filter(msg => msg.receiverId === this.device.id).length;

      // Get first message date (as proxy for "added date")
      let firstMessageDate = 'N/A';
      if (messages.length > 0) {
        const firstMessage = messages.reduce((earliest, current) =>
          current.timestamp < earliest.timestamp ? current : earliest
        );
        firstMessageDate = new Date(firstMessage.timestamp).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Get last message date
      let lastMessageDate = 'N/A';
      if (messages.length > 0) {
        const lastMessage = messages.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        );
        lastMessageDate = new Date(lastMessage.timestamp).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Get unread count
      const unreadCount = window.CyberpunkAgent.instance.getUnreadCountForDevices(this.device.id, contactId) || 0;

      // Get mute status
      const isMuted = window.CyberpunkAgent.instance.isContactMutedForDevice(this.device.id, contactId) || false;

      new Dialog({
        title: `Informações do Contato - ${contactDevice.deviceName || 'Contato'}`,
        content: `
          <div class="cp-contact-info-dialog">
            <div class="cp-contact-info-section">
              <h3><i class="fas fa-user"></i> Informações Básicas</h3>
              <p><strong>Nome:</strong> ${contactDevice.deviceName || 'Contato'}</p>
              <p><strong>Telefone:</strong> ${formattedPhone}</p>
              <p><strong>Status:</strong> ${isMuted ? '<span style="color: #ff6b6b;"><i class="fas fa-volume-mute"></i> Silenciado</span>' : '<span style="color: #51cf66;"><i class="fas fa-volume-up"></i> Ativo</span>'}</p>
            </div>
            
            <div class="cp-contact-info-section">
              <h3><i class="fas fa-comments"></i> Estatísticas de Mensagens</h3>
              <p><strong>Total de Mensagens:</strong> ${totalMessages}</p>
              <p><strong>Mensagens Enviadas:</strong> ${sentMessages}</p>
              <p><strong>Mensagens Recebidas:</strong> ${receivedMessages}</p>
              <p><strong>Não Lidas:</strong> ${unreadCount > 0 ? `<span style="color: #ff6b6b;">${unreadCount}</span>` : '0'}</p>
            </div>
            
            <div class="cp-contact-info-section">
              <h3><i class="fas fa-clock"></i> Histórico</h3>
              <p><strong>Primeira Mensagem:</strong> ${firstMessageDate}</p>
              <p><strong>Última Mensagem:</strong> ${lastMessageDate}</p>
            </div>
          </div>
        `,
        buttons: {
          close: {
            label: "Fechar"
          }
        }
      }).render(true);

    } catch (error) {
      console.error("AgentApplication | Error showing contact info:", error);
      ui.notifications.error("Erro ao carregar informações do contato");
    }
  }

  /**
   * Mark all messages as read for a contact
   */
  async _markAllMessagesAsRead(contactId) {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      await window.CyberpunkAgent.instance.markDeviceConversationAsRead(this.device.id, contactId);
      ui.notifications.info("Todas as mensagens foram marcadas como lidas!");

      // Force UI update using multiple strategies
      console.log("AgentApplication | Triggering UI update after marking messages as read");

      // Strategy 1: Use UI Controller if available
      if (window.CyberpunkAgentUIController) {
        const chat7ComponentId = `agent-chat7-${this.device.id}`;
        window.CyberpunkAgentUIController.markDirty(chat7ComponentId);
        console.log("AgentApplication | Marked Chat7 component as dirty via UI Controller");
      }

      // Strategy 2: Force immediate re-render
      this._renderChat7View();

      // Strategy 3: Dispatch custom event
      document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
        detail: {
          timestamp: Date.now(),
          type: 'messagesMarkedAsRead',
          actorId: this.device.id,
          contactId: contactId
        }
      }));
    }
  }

  /**
   * Clear conversation history for a contact
   */
  async _clearConversationHistory(contactId) {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Try to find contact in multiple ways
      let contact = window.CyberpunkAgent.instance.getContactsForDevice(this.device.id).find(c => c.id === contactId);

      // If not found in contacts, try to get contact info from device data
      if (!contact) {
        console.log("Cyberpunk Agent | Contact not found in device contacts, trying alternative lookup");
        const device = window.CyberpunkAgent.instance.devices.get(this.device.id);
        if (device && device.contacts) {
          contact = device.contacts.find(c => c.id === contactId);
        }
      }

      // If still not found, create a basic contact object for the dialog
      if (!contact) {
        console.log("Cyberpunk Agent | Contact not found, creating basic contact info");
        contact = {
          id: contactId,
          name: "Unknown Contact",
          deviceName: "Unknown Device"
        };
      }

      const isGM = game.user.isGM;
      const dialogTitle = isGM ? "Limpar Histórico (GM)" : "Limpar Histórico";
      const dialogContent = isGM
        ? `<div class="cp-clear-history-dialog">
             <p>Tem certeza que deseja limpar todo o histórico de conversa com <strong>${contact.name}</strong>?</p>
             <p><small><strong>ATENÇÃO:</strong> Como GM, esta ação afetará o histórico de AMBOS os dispositivos e será propagada para todos os jogadores.</small></p>
           </div>`
        : `<div class="cp-clear-history-dialog">
             <p>Tem certeza que deseja limpar todo o histórico de conversa com <strong>${contact.name}</strong>?</p>
             <p><small>Esta ação só afetará o seu histórico. O histórico do outro contato permanecerá intacto.</small></p>
           </div>`;

      const confirmed = await new Promise((resolve) => {
        new Dialog({
          title: dialogTitle,
          content: dialogContent,
          buttons: {
            cancel: {
              label: "Cancelar",
              callback: () => resolve(false)
            },
            confirm: {
              label: "Limpar Histórico",
              callback: () => resolve(true)
            }
          }
        }).render(true);
      });

      if (confirmed) {
        const success = await window.CyberpunkAgent.instance.clearDeviceConversationHistory(this.device.id, contactId, isGM);
        if (success) {
          // Refresh the view
          if (this.currentView === 'chat7') {
            this._renderChat7View();
          } else if (this.currentView === 'conversation' && this.currentContact?.id === contactId) {
            this._renderConversationView();
          }
        }
      }
    }
  }

  /**
   * Delete contact from device
   */
  async _deleteContact(contactId) {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      // Get contact information from device registry instead of contact list
      const contactDevice = window.CyberpunkAgent.instance.devices.get(contactId);

      if (!contactDevice) {
        ui.notifications.error("Contato não encontrado");
        return;
      }

      // Check if contact is actually in the device's contact list
      const contacts = window.CyberpunkAgent.instance.getContactsForDevice(this.device.id);
      if (!contacts.includes(contactId)) {
        ui.notifications.error("Contato não está na sua lista de contatos");
        return;
      }

      // Create contact object for display
      const contact = {
        id: contactId,
        name: contactDevice.deviceName || contactDevice.ownerName || `Device ${contactId}`,
        deviceName: contactDevice.deviceName,
        ownerName: contactDevice.ownerName
      };

      const confirmed = await new Promise((resolve) => {
        new Dialog({
          title: "Remover Contato",
          content: `
            <div class="cp-delete-contact-dialog">
              <p>Tem certeza que deseja remover <strong>${contact.name}</strong> da sua lista de contatos?</p>
              <p><small>Esta ação só removerá o contato da sua lista. O contato ainda poderá enviar mensagens para você, e o histórico de mensagens será preservado.</small></p>
            </div>
          `,
          buttons: {
            cancel: {
              label: "Cancelar",
              callback: () => resolve(false)
            },
            confirm: {
              label: "Remover Contato",
              callback: () => resolve(true)
            }
          }
        }).render(true);
      });

      if (confirmed) {
        console.log(`AgentApplication | Attempting to delete contact ${contactId} from device ${this.device.id}`);

        const success = await window.CyberpunkAgent.instance.removeContactFromDevice(this.device.id, contactId);
        if (success) {
          ui.notifications.info(`Contato ${contact.name} removido da sua lista`);
          console.log(`AgentApplication | Successfully deleted contact ${contactId}`);

          // Immediate UI refresh - always refresh the contact list
          console.log(`AgentApplication | Refreshing UI immediately after contact deletion`);

          if (this.currentView === 'chat7') {
            // If we're in chat7 view, refresh it to show updated contact list
            this._renderChat7View();
          } else if (this.currentView === 'conversation' && this.currentContact?.id === contactId) {
            // If we're viewing the conversation with the deleted contact, go back to chat7
            console.log(`AgentApplication | Navigating back to chat7 after deleting current contact`);
            this.currentView = 'chat7';
            this.currentContact = null;
            this._renderChat7View();
          } else if (this.currentView === 'conversation') {
            // If we're in a conversation with a different contact, just refresh the chat7 view
            // This ensures the contact list is updated even if we're not viewing the deleted contact
            console.log(`AgentApplication | Refreshing chat7 view while in conversation with different contact`);
            this._renderChat7View();
          }

          // Force a complete re-render to ensure UI is updated
          console.log(`AgentApplication | Forcing complete re-render after contact deletion`);
          this.render(true);

          // Add visual feedback to show the deletion was successful
          setTimeout(() => {
            // Trigger a brief visual effect to confirm the deletion
            const contactElement = $(`.cp-contact-item[data-contact-id="${contactId}"]`);
            if (contactElement.length > 0) {
              contactElement.fadeOut(300, function () {
                $(this).remove();
              });
            }
          }, 100);

          // Dispatch local contact update event for immediate UI refresh
          document.dispatchEvent(new CustomEvent('cyberpunk-agent-update', {
            detail: {
              type: 'contactUpdate',
              action: 'remove',
              deviceId: this.device.id,
              contactId: contactId,
              contactName: contact.name,
              timestamp: Date.now()
            }
          }));
        } else {
          console.error(`AgentApplication | Failed to delete contact ${contactId}`);
          ui.notifications.error("Erro ao remover contato");
        }
      }
    }
  }

  /**
   * Handle document click for context menu
   */
  _onDocumentClick(event) {
    if (!$(event.target).closest('.cp-context-menu').length) {
      $('.cp-context-menu').remove();
    }
  }

  /**
   * Delete a specific message
   */
  async _deleteMessage(messageId) {
    console.log("Cyberpunk Agent | Deleting message:", messageId);

    try {
      // Get the current contact from the conversation
      const contactId = this.currentContact?.id;
      if (!contactId) {
        console.error("Cyberpunk Agent | No contact found for message deletion");
        ui.notifications.error("Erro: Contato não encontrado!");
        return;
      }

      // Call the device-specific message deletion method
      const success = await window.CyberpunkAgent?.instance?.deleteDeviceMessages(this.device.id, contactId, [messageId]);

      if (success) {
        console.log("Cyberpunk Agent | Message deleted successfully");
        ui.notifications.info("Mensagem deletada com sucesso!");

        // Refresh the conversation view
        this._forceRenderConversationView();
      } else {
        console.error("Cyberpunk Agent | Failed to delete message");
        ui.notifications.error("Erro ao deletar mensagem!");
      }
    } catch (error) {
      console.error("Cyberpunk Agent | Error deleting message:", error);
      ui.notifications.error("Erro ao deletar mensagem!");
    }
  }

  /**
   * Copy message text to clipboard
   */
  _copyMessageText(messageText) {
    try {
      navigator.clipboard.writeText(messageText).then(() => {
        console.log("Cyberpunk Agent | Message text copied to clipboard");
        ui.notifications.info("Texto copiado para a área de transferência!");
      }).catch(err => {
        console.error("Cyberpunk Agent | Error copying text to clipboard:", err);
        ui.notifications.error("Erro ao copiar texto!");
      });
    } catch (error) {
      console.error("Cyberpunk Agent | Error copying message text:", error);
      ui.notifications.error("Erro ao copiar texto!");
    }
  }

  /**
   * Edit a specific message
   */
  async _editMessage(messageId, currentText) {
    console.log("Cyberpunk Agent | Editing message:", messageId);

    try {
      // Get the current contact from the conversation
      const contactId = this.currentContact?.id;
      if (!contactId) {
        console.error("Cyberpunk Agent | No contact found for message editing");
        ui.notifications.error("Erro: Contato não encontrado!");
        return;
      }

      // Show the cyberpunk editing modal
      this._showMessageEditModal(messageId, currentText, contactId);

    } catch (error) {
      console.error("Cyberpunk Agent | Error editing message:", error);
      ui.notifications.error("Erro ao editar mensagem: " + error.message);
    }
  }

  /**
   * Show cyberpunk-styled message editing modal
   */
  _showMessageEditModal(messageId, currentText, contactId) {
    // Remove any existing edit modal
    $('.cp-edit-modal').remove();

    // Create the cyberpunk-styled modal
    const modal = $(`
      <div class="cp-edit-modal">
        <div class="cp-edit-modal-backdrop"></div>
        <div class="cp-edit-modal-container">
          <div class="cp-edit-modal-header">
            <div class="cp-edit-modal-title">
              <i class="fas fa-edit"></i>
              <span>EDITAR MENSAGEM</span>
            </div>
            <div class="cp-edit-modal-protocol">NEURO_EDIT_PROTOCOL_v2.1</div>
          </div>
          
          <div class="cp-edit-modal-body">
            <div class="cp-edit-input-label">CONTEÚDO DA MENSAGEM:</div>
            <div class="cp-edit-input-wrapper">
              <textarea class="cp-edit-textarea" placeholder="Digite sua mensagem..." maxlength="500">${currentText}</textarea>
              <div class="cp-edit-char-counter">
                <span class="cp-edit-char-count">${currentText.length}</span>/500
              </div>
            </div>
            <div class="cp-edit-hint">SHIFT+ENTER para quebra de linha • CTRL+ENTER para salvar • ESC para cancelar</div>
          </div>
          
          <div class="cp-edit-modal-footer">
            <button class="cp-edit-btn cp-edit-btn-cancel">
              <i class="fas fa-times"></i>
              CANCELAR
            </button>
            <button class="cp-edit-btn cp-edit-btn-save">
              <i class="fas fa-save"></i>
              SALVAR ALTERAÇÕES
            </button>
          </div>
        </div>
      </div>
    `);

    // Add to the agent container (not body) for proper styling
    this.element.append(modal);

    // Get references to elements
    const textarea = modal.find('.cp-edit-textarea');
    const charCount = modal.find('.cp-edit-char-count');
    const saveBtn = modal.find('.cp-edit-btn-save');
    const cancelBtn = modal.find('.cp-edit-btn-cancel');

    // Auto-resize textarea and update character count
    const updateTextarea = () => {
      // Auto-resize
      textarea[0].style.height = 'auto';
      const lineHeight = parseInt(window.getComputedStyle(textarea[0]).lineHeight);
      const maxHeight = lineHeight * 5;
      const newHeight = Math.min(textarea[0].scrollHeight, maxHeight);
      textarea[0].style.height = newHeight + 'px';
      textarea[0].style.overflowY = textarea[0].scrollHeight > maxHeight ? 'auto' : 'hidden';

      // Update character count
      const currentLength = textarea.val().length;
      charCount.text(currentLength);
      charCount.toggleClass('cp-edit-char-warning', currentLength > 450);
      charCount.toggleClass('cp-edit-char-limit', currentLength >= 500);
    };

    // Initial textarea setup
    updateTextarea();
    textarea.focus();
    textarea[0].setSelectionRange(textarea.val().length, textarea.val().length);

    // Event listeners
    textarea.on('input', updateTextarea);

    // Handle keyboard shortcuts
    textarea.on('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && event.ctrlKey) {
        event.preventDefault();
        saveBtn.click();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelBtn.click();
      }
    });

    // Cancel button
    cancelBtn.click(() => {
      modal.addClass('cp-edit-modal-closing');
      setTimeout(() => modal.remove(), 300);
    });

    // Backdrop click to cancel
    modal.find('.cp-edit-modal-backdrop').click(() => {
      cancelBtn.click();
    });

    // Save button
    saveBtn.click(async () => {
      const newText = textarea.val().trim();

      if (!newText) {
        ui.notifications.error("Mensagem não pode estar vazia!");
        return;
      }

      if (newText === currentText) {
        ui.notifications.info("Nenhuma alteração foi feita.");
        cancelBtn.click();
        return;
      }

      // Disable buttons during save
      saveBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> SALVANDO...');
      cancelBtn.prop('disabled', true);

      try {
        // Call the message editing method
        const success = await this._saveMessageEdit(messageId, contactId, newText, currentText);

        if (success) {
          ui.notifications.info("Mensagem editada com sucesso!");
          modal.addClass('cp-edit-modal-closing');
          setTimeout(() => modal.remove(), 300);

          // Refresh the conversation view
          this._forceRenderConversationView();
        } else {
          ui.notifications.error("Erro ao editar mensagem!");
          // Re-enable buttons
          saveBtn.prop('disabled', false).html('<i class="fas fa-save"></i> SALVAR ALTERAÇÕES');
          cancelBtn.prop('disabled', false);
        }
      } catch (error) {
        console.error("Cyberpunk Agent | Error saving message edit:", error);
        ui.notifications.error("Erro ao salvar alterações: " + error.message);
        // Re-enable buttons
        saveBtn.prop('disabled', false).html('<i class="fas fa-save"></i> SALVAR ALTERAÇÕES');
        cancelBtn.prop('disabled', false);
      }
    });

    // Show modal with animation
    setTimeout(() => modal.addClass('cp-edit-modal-show'), 10);
  }

  /**
   * Save message edit changes
   */
  async _saveMessageEdit(messageId, contactId, newText, originalText) {
    console.log("Cyberpunk Agent | Saving message edit:", messageId, newText);

    try {
      // Call the CyberpunkAgent instance to handle the edit
      const success = await window.CyberpunkAgent?.instance?.editDeviceMessage(
        this.device.id,
        contactId,
        messageId,
        newText,
        originalText
      );

      return success;
    } catch (error) {
      console.error("Cyberpunk Agent | Error in _saveMessageEdit:", error);
      throw error;
    }
  }

  /**
   * Show message information
   */
  _showMessageInfo(messageId, messageText, messageTime) {
    console.log("Cyberpunk Agent | Showing message info:", { messageId, messageText, messageTime });

    const infoText = `
      <strong>ID da Mensagem:</strong> ${messageId}<br>
      <strong>Texto:</strong> ${messageText}<br>
      <strong>Horário:</strong> ${messageTime}<br>
      <strong>Dispositivo:</strong> ${this.device.deviceName || this.device.id}
    `;

    new Dialog({
      title: "Informações da Mensagem",
      content: infoText,
      buttons: {
        close: {
          label: "Fechar",
          callback: () => { }
        }
      }
    }).render(true);
  }

  /**
   * Handle send message button click
   */
  _onSendMessage(event) {
    event.preventDefault();
    this._sendMessage();
  }

  /**
   * Handle message input keypress
   */
  _onMessageInputKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this._sendMessage();
    } else {
      // Auto-resize textarea
      setTimeout(() => {
        this._autoResizeTextarea(event.target);
      }, 0);
    }
  }

  /**
   * Auto-resize textarea based on content
   */
  _autoResizeTextarea(textarea) {
    // Reset height to calculate new height
    textarea.style.height = 'auto';

    // Calculate new height (max 5 lines)
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 5;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = newHeight + 'px';

    // Show scrollbar if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  /**
   * Send message
   */
  async _sendMessage() {
    const input = this.element.find('.cp-message-input');
    const text = input.val();

    // Only trim whitespace at the beginning and end, preserve internal line breaks
    const trimmedText = text.replace(/^\s+|\s+$/g, '');

    if (!trimmedText || !this.currentContact || !this.currentContact.id) {
      console.warn("AgentApplication | Cannot send message: missing text or currentContact");
      return;
    }

    // Clear input and reset height
    input.val('');
    if (input[0] && input[0].tagName === 'TEXTAREA') {
      input[0].style.height = 'auto';
      input[0].style.overflowY = 'hidden';
    }

    // Send message through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      try {
        const success = await window.CyberpunkAgent.instance.sendDeviceMessage(this.device.id, this.currentContact.id, trimmedText);

        if (success) {
          console.log("Cyberpunk Agent | Device message sent successfully");

          // Force immediate conversation refresh after sending
          setTimeout(() => {
            console.log("AgentApplication | Force refreshing conversation after message sent");
            this.render(true);
          }, 100);

        } else {
          console.error("Cyberpunk Agent | Failed to send device message");
          ui.notifications.error("Falha ao enviar mensagem");
        }
      } catch (error) {
        console.error("Cyberpunk Agent | Error sending message:", error);
        ui.notifications.error("Erro ao enviar mensagem: " + error.message);
      }
    }
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Agent form updated:", formData);
  }

  /**
   * Handle phone input changes
   */
  _onPhoneInput(event) {
    const input = event.target;
    const rawValue = input.value.replace(/\D/g, ''); // Remove non-digits

    // Apply US phone number mask
    const maskedValue = this._applyPhoneMask(rawValue);
    input.value = maskedValue;

    // Store the raw number (without mask) for processing
    this.addContactState.phoneNumber = rawValue;
    console.log('AgentApplication | _onPhoneInput - Raw value stored:', rawValue);
    console.log('AgentApplication | _onPhoneInput - Masked value displayed:', maskedValue);

    this.addContactState.errorMessage = null;
    this.addContactState.successMessage = null;
    this.addContactState.searchResult = null;

    this._updateSearchButton();
  }

  /**
   * Apply US phone number mask
   * @param {string} rawNumber - Raw digits only
   * @returns {string} Masked phone number
   */
  _applyPhoneMask(rawNumber) {
    if (!rawNumber) return '';

    // Limit to 11 digits (1 + area code + prefix + line number)
    const limited = rawNumber.substring(0, 11);

    if (limited.length <= 3) {
      return `(${limited}`;
    } else if (limited.length <= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
    } else if (limited.length <= 10) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else {
      // 11 digits - add +1 prefix
      return `+1 (${limited.substring(1, 4)}) ${limited.substring(4, 7)}-${limited.substring(7)}`;
    }
  }

  /**
   * Handle phone input keypress
   */
  _onPhoneKeypress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this._onSearchClick();
    }
  }

  /**
   * Handle search button click
   */
  async _onSearchClick() {
    if (!this.addContactState.phoneNumber.trim()) {
      this._showError('Digite um número de telefone');
      return;
    }

    this.addContactState.isSearching = true;
    this.addContactState.errorMessage = null;
    this.addContactState.successMessage = null;
    this.addContactState.searchResult = null;
    this.render(true);

    try {
      // Debug: Log the raw phone number
      console.log('AgentApplication | _onSearchClick - Raw phone number:', this.addContactState.phoneNumber);

      // Normalize the phone number before searching
      const normalizedPhone = window.CyberpunkAgent?.instance?.normalizePhoneNumber(this.addContactState.phoneNumber);
      console.log('AgentApplication | _onSearchClick - Normalized phone number:', normalizedPhone);

      // Search for the phone number
      const contactDeviceId = window.CyberpunkAgent?.instance?.getDeviceIdFromPhoneNumber(normalizedPhone);
      console.log('AgentApplication | _onSearchClick - Contact device ID found:', contactDeviceId);

      if (!contactDeviceId) {
        const displayNumber = window.CyberpunkAgent?.instance?.formatPhoneNumberForDisplay(normalizedPhone) || normalizedPhone;
        console.log('AgentApplication | _onSearchClick - No contact found for:', displayNumber);
        this._showError(`Nenhum contato encontrado para o número ${displayNumber}`);
        return;
      }

      // Get contact device info
      const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactDeviceId);
      if (!contactDevice) {
        this._showError('Informações do contato não encontradas');
        return;
      }

      // Check if trying to add self
      if (contactDeviceId === this.device.id) {
        this._showError('Você não pode adicionar seu próprio número aos contatos');
        return;
      }

      // Check if already a contact
      const isAlreadyContact = window.CyberpunkAgent?.instance?.isDeviceContact(this.device.id, contactDeviceId);
      if (isAlreadyContact) {
        this._showError('Este contato já está na sua lista');
        return;
      }

      // Show search result with proper owner name and avatar
      const ownerName = window.CyberpunkAgent?.instance?.getDeviceOwnerName(contactDeviceId) || contactDevice.deviceName || `Device ${contactDeviceId}`;

      // Get actor avatar if available, fallback to device avatar
      let deviceAvatar = contactDevice.img || 'icons/svg/mystery-man.svg';
      if (contactDevice.ownerActorId) {
        const actor = game.actors.get(contactDevice.ownerActorId);
        if (actor && actor.img) {
          deviceAvatar = actor.img;
        }
      }

      this.addContactState.searchResult = {
        deviceId: contactDeviceId,
        name: ownerName,
        img: deviceAvatar,
        phoneNumber: normalizedPhone,
        displayPhoneNumber: window.CyberpunkAgent?.instance?.formatPhoneNumberForDisplay(normalizedPhone) || normalizedPhone
      };

      this.render(true);

    } catch (error) {
      console.error('AgentApplication | Error searching for contact:', error);
      this._showError('Erro ao buscar contato');
    } finally {
      this.addContactState.isSearching = false;
      this.render(true);
    }
  }

  /**
   * Handle add contact button click
   */
  async _onAddContactClick() {
    if (!this.addContactState.searchResult) {
      return;
    }

    try {
      // Add contact by phone number
      const result = window.CyberpunkAgent?.instance?.addContactByPhoneNumber(this.device.id, this.addContactState.searchResult.phoneNumber);

      if (result && result.success) {
        // Show success message
        this.addContactState.successMessage = result.message;
        this.addContactState.errorMessage = null;
        this.addContactState.searchResult = null;
        this.addContactState.phoneNumber = '';

        this.render(true);

        // Auto-fade success message after 3 seconds but stay on add contact screen
        setTimeout(() => {
          if (this.addContactState.successMessage === result.message) {
            // Add fading class for smooth transition
            const successElement = this.element?.find('.cp-success-message');
            if (successElement) {
              successElement.addClass('fading');
              // Clear success message after fade animation completes (but don't navigate)
              setTimeout(() => {
                this.addContactState.successMessage = null;
                this.render(true);
                // User stays on add-contact screen - they can navigate manually using back button
              }, 500);
            } else {
              this.addContactState.successMessage = null;
              this.render(true);
              // User stays on add-contact screen - they can navigate manually using back button
            }
          }
        }, 3000);
      } else {
        this._showError(result?.message || 'Erro ao adicionar contato');
      }

    } catch (error) {
      console.error('AgentApplication | Error adding contact:', error);
      this._showError('Erro ao adicionar contato');
    }
  }

  /**
   * Update search button state
   */
  _updateSearchButton() {
    const searchBtn = this.element?.find('.cp-search-btn');
    if (searchBtn) {
      const hasPhoneNumber = this.addContactState.phoneNumber.trim().length > 0;
      searchBtn.prop('disabled', !hasPhoneNumber);
    }
  }

  /**
   * Show error message
   */
  _showError(message) {
    this.addContactState.errorMessage = message;
    this.addContactState.successMessage = null;
    this.addContactState.searchResult = null;
    this.render(true);

    // Auto-fade error message after 5 seconds
    setTimeout(() => {
      if (this.addContactState.errorMessage === message) {
        // Add fading class for smooth transition
        const errorElement = this.element?.find('.cp-error-message');
        if (errorElement) {
          errorElement.addClass('fading');
          // Remove message after fade animation completes
          setTimeout(() => {
            this.addContactState.errorMessage = null;
            this.render(true);
          }, 500);
        } else {
          this.addContactState.errorMessage = null;
          this.render(true);
        }
      }
    }, 5000);
  }

  /**
   * Activate ZMail listeners
   */
  _activateZMailListeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-zmail-action-btn[data-action="refresh"]').click(this._onZMailRefreshClick.bind(this));
    html.find('.cp-zmail-message-item[data-action="open-message"]').click(this._onZMailMessageClick.bind(this));
    html.find('.cp-zmail-delete-btn[data-action="delete-message"]').click(this._onZMailDeleteClick.bind(this));
  }

  /**
   * Activate ZMail message listeners
   */
  _activateZMailMessageListeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-zmail-action-btn[data-action="delete-message"]').click(this._onZMailDeleteClick.bind(this));
  }

  /**
   * Activate Memo listeners
   */
  _activateMemoListeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-memo-action-btn[data-action="new-note"]').click(this._onNewNoteClick.bind(this));
    html.find('.cp-memo-note-item[data-action="open-note"]').click(this._onMemoNoteClick.bind(this));
    html.find('.cp-memo-edit-btn[data-action="edit-note"]').click(this._onMemoEditClick.bind(this));
    html.find('.cp-memo-delete-btn[data-action="delete-note"]').click(this._onMemoDeleteClick.bind(this));
  }

  /**
   * Activate Memo note listeners
   */
  _activateMemoNoteListeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-memo-save-btn[data-action="save-note"]').click(this._onMemoSaveClick.bind(this));

    // Auto-resize textarea
    html.find('.cp-memo-content-input').on('input', (event) => {
      this._autoResizeTextarea(event.target);
    });

    // Character counter
    html.find('.cp-memo-content-input').on('input', (event) => {
      this._updateMemoCharCounter(event.target);
    });
  }

  /**
   * Handle ZMail refresh click
   */
  _onZMailRefreshClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("ZMail refresh clicked");

    // Refresh ZMail data
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.loadZMailData().then(() => {
        this.render(true);
        ui.notifications.info("ZMail atualizado!");
      });
    }
  }

  /**
   * Handle ZMail message click
   */
  _onZMailMessageClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const messageId = event.currentTarget.dataset.messageId;
    console.log("ZMail message clicked:", messageId);

    // Find the message
    const messages = window.CyberpunkAgent?.instance?.getZMailMessages(this.device.id) || [];
    const message = messages.find(msg => msg.id === messageId);

    if (message) {
      // Play opening sound effect (same as opening a chat conversation)
      if (window.CyberpunkAgent?.instance) {
        window.CyberpunkAgent.instance.playSoundEffect('opening-window');
      }

      // Mark as read
      window.CyberpunkAgent?.instance?.markZMailMessageAsRead(this.device.id, messageId);

      // Set current message and navigate
      this.currentZMailMessage = message;
      this.navigateTo('zmail-message');
    }
  }

  /**
   * Handle ZMail link click in CHAT7 conversation
   */
  _onZMailLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const messageId = event.currentTarget.dataset.zmailId;
    console.log("ZMail link clicked:", messageId);

    // Find the ZMail message
    const messages = window.CyberpunkAgent?.instance?.getZMailMessages(this.device.id) || [];
    const message = messages.find(msg => msg.id === messageId);

    if (message) {
      // Play opening sound effect
      if (window.CyberpunkAgent?.instance) {
        window.CyberpunkAgent.instance.playSoundEffect('opening-window');
      }

      // Mark as read
      window.CyberpunkAgent?.instance?.markZMailMessageAsRead(this.device.id, messageId);

      // Set current message and navigate to ZMail
      this.currentZMailMessage = message;
      this.navigateTo('zmail-message');
    } else {
      ui.notifications.warn("ZMail message not found or you don't have access to it.");
    }
  }

  /**
   * Handle ZMail delete click
   */
  _onZMailDeleteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const messageId = event.currentTarget.dataset.messageId;
    console.log("ZMail delete clicked:", messageId);

    // Show confirmation dialog
    new Dialog({
      title: "Deletar ZMail",
      content: `
        <div class="cp-delete-zmail-dialog">
          <p>Tem certeza que deseja deletar esta mensagem ZMail?</p>
          <p><small>Esta ação não pode ser desfeita.</small></p>
        </div>
      `,
      buttons: {
        cancel: {
          label: "Cancelar",
          callback: () => console.log("ZMail deletion cancelled")
        },
        confirm: {
          label: "Deletar",
          callback: async () => {
            const success = await window.CyberpunkAgent?.instance?.deleteZMailMessage(this.device.id, messageId);
            if (success) {
              ui.notifications.info("ZMail deletado com sucesso!");
              this.render(true);
            } else {
              ui.notifications.error("Erro ao deletar ZMail!");
            }
          }
        }
      }
    }).render(true);
  }

  /**
   * Handle new note click
   */
  _onNewNoteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("New note clicked");

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Create new note and navigate to editor
    this.currentMemoNote = {
      id: null,
      title: '',
      content: '',
      timestamp: Date.now()
    };
    this.navigateTo('memo-note');
  }

  /**
   * Handle memo note click
   */
  _onMemoNoteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const noteId = event.currentTarget.dataset.noteId;
    console.log("Memo note clicked:", noteId);

    // Find the note
    const notes = window.CyberpunkAgent?.instance?.getMemoNotes(this.device.id) || [];
    const note = notes.find(n => n.id === noteId);

    if (note) {
      // Play opening sound effect
      if (window.CyberpunkAgent?.instance) {
        window.CyberpunkAgent.instance.playSoundEffect('opening-window');
      }

      // Set current note and navigate
      this.currentMemoNote = note;
      this.navigateTo('memo-note');
    }
  }

  /**
   * Handle memo edit click
   */
  _onMemoEditClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const noteId = event.currentTarget.dataset.noteId;
    console.log("Memo edit clicked:", noteId);

    // Find the note
    const notes = window.CyberpunkAgent?.instance?.getMemoNotes(this.device.id) || [];
    const note = notes.find(n => n.id === noteId);

    if (note) {
      // Play opening sound effect
      if (window.CyberpunkAgent?.instance) {
        window.CyberpunkAgent.instance.playSoundEffect('opening-window');
      }

      // Set current note and navigate
      this.currentMemoNote = note;
      this.navigateTo('memo-note');
    }
  }

  /**
   * Handle memo delete click
   */
  _onMemoDeleteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const noteId = event.currentTarget.dataset.noteId;
    console.log("Memo delete clicked:", noteId);

    // Find the note
    const notes = window.CyberpunkAgent?.instance?.getMemoNotes(this.device.id) || [];
    const note = notes.find(n => n.id === noteId);

    if (note) {
      // Show confirmation dialog
      new Dialog({
        title: "Deletar Nota",
        content: `
          <div class="cp-delete-memo-dialog">
            <p>Tem certeza que deseja deletar a nota "<strong>${note.title}</strong>"?</p>
            <p><small>Esta ação não pode ser desfeita.</small></p>
          </div>
        `,
        buttons: {
          cancel: {
            label: "Cancelar",
            callback: () => console.log("Memo deletion cancelled")
          },
          confirm: {
            label: "Deletar",
            callback: async () => {
              const success = await window.CyberpunkAgent?.instance?.deleteMemoNote(this.device.id, noteId);
              if (success) {
                ui.notifications.info("Nota deletada com sucesso!");
                this.render(true);
              } else {
                ui.notifications.error("Erro ao deletar nota!");
              }
            }
          }
        }
      }).render(true);
    }
  }

  /**
   * Handle memo save click
   */
  async _onMemoSaveClick(event) {
    event.preventDefault();
    console.log("Memo save clicked");

    const titleInput = this.element.find('.cp-memo-title-input');
    const contentInput = this.element.find('.cp-memo-content-input');

    const title = titleInput.val().trim();
    const content = contentInput.val().trim();

    if (!title) {
      ui.notifications.error("Título da nota é obrigatório!");
      return;
    }

    if (!content) {
      ui.notifications.error("Conteúdo da nota é obrigatório!");
      return;
    }

    try {
      let success;
      if (this.currentMemoNote && this.currentMemoNote.id) {
        // Update existing note
        success = await window.CyberpunkAgent?.instance?.updateMemoNote(
          this.device.id,
          this.currentMemoNote.id,
          title,
          content
        );
      } else {
        // Create new note
        success = await window.CyberpunkAgent?.instance?.createMemoNote(
          this.device.id,
          title,
          content
        );
      }

      if (success) {
        ui.notifications.info("Nota salva com sucesso!");
        this.navigateTo('memo');
      } else {
        ui.notifications.error("Erro ao salvar nota!");
      }
    } catch (error) {
      console.error("Error saving memo note:", error);
      ui.notifications.error("Erro ao salvar nota: " + error.message);
    }
  }

  /**
   * Update memo character counter
   */
  _updateMemoCharCounter(textarea) {
    const charCount = this.element.find('.cp-memo-char-count');
    const currentLength = textarea.value.length;
    charCount.text(currentLength);

    // Add warning classes for character limits
    charCount.toggleClass('cp-edit-char-warning', currentLength > 1800);
    charCount.toggleClass('cp-edit-char-limit', currentLength >= 2000);
  }
}

// Legacy classes for backward compatibility
class AgentHomeApplication extends AgentApplication {
  constructor(device, options = {}) {
    super(device, options);
    this.currentView = 'home';
  }
}

class Chat7Application extends AgentApplication {
  constructor(device, options = {}) {
    super(device, options);
    this.currentView = 'chat7';
  }
}

class ChatConversationApplication extends AgentApplication {
  constructor(device, contact, options = {}) {
    super(device, options);
    this.currentView = 'conversation';
    this.currentContact = contact;
  }
}

// Export classes for global access
window.AgentApplication = AgentApplication;
window.AgentHomeApplication = AgentHomeApplication;
window.Chat7Application = Chat7Application;
window.ChatConversationApplication = ChatConversationApplication;

console.log("Cyberpunk Agent | agent-home.js loaded successfully");
console.log("Cyberpunk Agent | AgentApplication defined:", typeof AgentApplication);
console.log("Cyberpunk Agent | AgentHomeApplication defined:", typeof AgentHomeApplication);
console.log("Cyberpunk Agent | Chat7Application defined:", typeof Chat7Application);
console.log("Cyberpunk Agent | ChatConversationApplication defined:", typeof ChatConversationApplication);
console.log("Cyberpunk Agent | Classes made globally available");
console.log("Cyberpunk Agent | Classes made globally available"); 