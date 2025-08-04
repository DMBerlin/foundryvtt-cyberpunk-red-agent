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
    this.currentView = 'home'; // 'home', 'chat7', 'conversation'
    this.currentContact = null;
    this.views = {
      home: this._renderHomeView.bind(this),
      chat7: this._renderChat7View.bind(this),
      conversation: this._renderConversationView.bind(this),
      'add-contact': this._renderAddContactView.bind(this)
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

        return {
          id: contactDeviceId,
          name: contactDevice.deviceName || `Device ${contactDeviceId}`,
          img: contactDevice.img || 'icons/svg/mystery-man.svg',
          unreadCount: unreadCount > 0 ? unreadCount : null,
          isMuted: isMuted
        };
      }).filter(contact => contact !== null); // Remove null contacts

      templateData.contacts = contactsWithData;
      templateData.isGM = game.user.isGM;

      console.log("AgentApplication | Template data for Chat7:", {
        contactsCount: contactsWithData.length,
        contacts: contactsWithData
      });
    } else if (this.currentView === 'conversation' && this.currentContact && this.currentContact.id) {
      // Add conversation-specific data
      const messages = window.CyberpunkAgent?.instance?.getMessagesForDeviceConversation(this.device.id, this.currentContact.id) || [];

      // Format messages for the Handlebars template
      const formattedMessages = messages.map(message => ({
        ...message,
        text: message.text || message.message, // Use 'text' property, fallback to 'message' for compatibility
        isOwn: message.senderId === this.device.id,
        time: message.time || new Date(message.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      templateData.messages = formattedMessages;
      templateData.contact = this.currentContact;

      console.log("AgentApplication | Template data for conversation:", {
        messagesCount: formattedMessages.length,
        contact: this.currentContact.name,
        messages: formattedMessages
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
    }

    return templateData;
  }

  /**
   * Render the application with the current view
   */
  render(force = false, options = {}) {
    // Prevent infinite loops during rendering
    if (this._isRendering) {
      console.log("AgentApplication | Already rendering, skipping render call");
      return this;
    }

    this._isRendering = true;

    try {
      const result = super.render(force, options);

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
  navigateTo(view, contact = null) {
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
      } else {
        // Clear active conversation when navigating away from conversation view
        window.CyberpunkAgent.instance.clearActiveConversation(game.user.id);
        console.log(`AgentApplication | Cleared active conversation for user ${game.user.id}`);
      }
    }

    this.currentView = view;
    this.currentContact = contact;

    // Update the template based on view
    this._updateTemplate();

    // Re-render with new data
    this.render(true);
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
      default:
        templatePath = "modules/cyberpunk-agent/templates/agent-home.html";
    }

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
  _renderConversationView() {
    console.log("AgentApplication | Rendering conversation view for contact:", this.currentContact);

    if (!this.currentContact) {
      console.error("AgentApplication | No contact specified for conversation view");
      return;
    }

    // Mark conversation as read when opening (not during re-renders)
    // This ensures that when a user opens a conversation, all messages are marked as read
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      console.log("AgentApplication | Marking conversation as read for contact:", this.currentContact.id);
      window.CyberpunkAgent.instance.markDeviceConversationAsRead(this.device.id, this.currentContact.id);
    }

    // Get messages for the conversation
    const messages = window.CyberpunkAgent?.instance?.getMessagesForDeviceConversation(this.device.id, this.currentContact.id) || [];
    console.log("AgentApplication | Messages for conversation:", messages.length, messages);

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

        // Check if the application is actually rendered and visible
        if (!this.rendered || !this.element || !this.element.is(':visible')) {
          console.log("AgentApplication | Application not rendered or visible, skipping update");
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
        } else {
          this._renderChat7View();
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
    }
  }

  /**
   * Activate home view listeners
   */
  _activateHomeListeners(html) {
    html.find('.cp-app-icon[data-app="chat7"]').click(this._onChat7Click.bind(this));
    html.find('.cp-phone-number[data-action="copy-phone-number"]').click(this._onPhoneNumberClick.bind(this));
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
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-send-message').click(this._onSendMessage.bind(this));
    html.find('.cp-message-input').keypress(this._onMessageInputKeypress.bind(this));

    // Message context menu
    html.find('.cp-message[data-action="message-context-menu"]').contextmenu(this._onMessageContextMenu.bind(this));
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
      default:
        this.navigateTo('home');
    }
  }

  /**
   * Handle contact chat button click
   */
  _onContactChatClick(event) {
    event.preventDefault();
    const contactId = event.currentTarget.dataset.contactId;
    console.log("Contact chat clicked for contact:", contactId);

    // Get contact device data directly from the devices map
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactId);

    if (!contactDevice) {
      console.error(`Cyberpunk Agent | Contact device ${contactId} not found in devices map`);
      ui.notifications.error("Contato não encontrado!");
      return;
    }

    // Create contact object with the required fields
    const contact = {
      id: contactId,
      name: contactDevice.deviceName || `Device ${contactId}`,
      img: contactDevice.img || 'icons/svg/mystery-man.svg'
    };

    console.log("Cyberpunk Agent | Contact data for conversation:", contact);

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to conversation view
    this.navigateTo('conversation', contact);
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

    // Get contact device data directly from the devices map
    const contactDevice = window.CyberpunkAgent?.instance?.devices?.get(contactId);

    if (!contactDevice) {
      console.error(`Cyberpunk Agent | Contact device ${contactId} not found in devices map`);
      return;
    }

    // Create contact object with the required fields
    const contact = {
      id: contactId,
      name: contactDevice.deviceName || `Device ${contactId}`,
      img: contactDevice.img || 'icons/svg/mystery-man.svg'
    };

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

    // GM can access context menu on all messages, players only on their own messages
    if (!game.user.isGM && !isOwnMessage) {
      console.log("Cyberpunk Agent | Context menu blocked: User does not own this message and is not GM");
      ui.notifications.warn("Você só pode acessar o menu de contexto das suas próprias mensagens.");
      return;
    }

    this._showMessageContextMenu(event, messageId, messageText, messageTime);
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
        <button class="cp-context-menu-item" data-action="clear-history" data-contact-id="${contact.id}">
          <i class="fas fa-trash"></i>Limpar Histórico
        </button>
        <button class="cp-context-menu-item" data-action="info" data-contact-id="${contact.id}">
          <i class="fas fa-info-circle"></i>Informações do Contato
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
    contextMenu.find('[data-action="clear-history"]').click(() => {
      this._clearConversationHistory(contact.id);
      $('.cp-context-menu').remove();
    });
    contextMenu.find('[data-action="info"]').click(() => {
      this._showContactInfo(contact.id);
      $('.cp-context-menu').remove();
    });

    $('body').append(contextMenu);
  }

  /**
   * Show context menu for message
   */
  _showMessageContextMenu(event, messageId, messageText, messageTime) {
    // Remove any existing context menu
    $('.cp-context-menu').remove();

    const contextMenu = $(`
      <div class="cp-context-menu" style="position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;">
        <button class="cp-context-menu-item" data-action="delete-message" data-message-id="${messageId}">
          <i class="fas fa-trash"></i>Deletar Mensagem
        </button>
        <button class="cp-context-menu-item" data-action="copy-message" data-message-id="${messageId}">
          <i class="fas fa-copy"></i>Copiar Texto
        </button>
        <button class="cp-context-menu-item" data-action="message-info" data-message-id="${messageId}">
          <i class="fas fa-info-circle"></i>Informações da Mensagem
        </button>
      </div>
    `);

    // Add event listeners with menu removal
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
      // Show confirmation dialog
      const contact = window.CyberpunkAgent.instance.getContactsForDevice(this.device.id).find(c => c.id === contactId);

      if (!contact) {
        ui.notifications.error("Contato não encontrado");
        return;
      }

      const confirmed = await new Promise((resolve) => {
        new Dialog({
          title: "Limpar Histórico",
          content: `
            <div class="cp-clear-history-dialog">
              <p>Tem certeza que deseja limpar todo o histórico de conversa com <strong>${contact.name}</strong>?</p>
              <p><small>Esta ação só afetará o seu histórico. O histórico do outro contato permanecerá intacto.</small></p>
            </div>
          `,
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
        const success = await window.CyberpunkAgent.instance.clearDeviceConversationHistory(this.device.id, contactId);
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
    }
  }

  /**
   * Send message
   */
  async _sendMessage() {
    const input = this.element.find('.cp-message-input');
    const text = input.val().trim();

    if (!text || !this.currentContact || !this.currentContact.id) {
      console.warn("AgentApplication | Cannot send message: missing text or currentContact");
      return;
    }

    // Clear input
    input.val('');

    // Send message through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      try {
        await window.CyberpunkAgent.instance.sendDeviceMessage(this.device.id, this.currentContact.id, text);
        console.log("Cyberpunk Agent | Device message sent successfully");

        // Simple and direct UI update after sending message
        console.log("AgentApplication | Triggering UI update after sending message");

        // Use a simple approach: just mark the conversation component as dirty
        if (window.CyberpunkAgentUIController) {
          const conversationComponentId = `agent-conversation-${this.device.id}-${this.currentContact.id}`;
          window.CyberpunkAgentUIController.markDirty(conversationComponentId);
          console.log("AgentApplication | Marked conversation component as dirty after sending message");
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

      // Show search result
      this.addContactState.searchResult = {
        deviceId: contactDeviceId,
        name: contactDevice.deviceName || `Device ${contactDeviceId}`,
        img: contactDevice.img || 'icons/svg/mystery-man.svg',
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

        // Auto-fade success message after 3 seconds and navigate back after fade completes
        setTimeout(() => {
          if (this.addContactState.successMessage === result.message) {
            // Add fading class for smooth transition
            const successElement = this.element?.find('.cp-success-message');
            if (successElement) {
              successElement.addClass('fading');
              // Navigate back after fade animation completes
              setTimeout(() => {
                this.addContactState.successMessage = null;
                this.render(true);
                // Navegar para a lista de contatos só se o usuário ainda estiver na tela de adicionar contato
                if (this.currentView === 'add-contact') {
                  this.navigateTo('chat7');
                }
              }, 500);
            } else {
              this.addContactState.successMessage = null;
              this.render(true);
              // Navegar para a lista de contatos só se o usuário ainda estiver na tela de adicionar contato
              if (this.currentView === 'add-contact') {
                this.navigateTo('chat7');
              }
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