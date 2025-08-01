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
      conversation: this._renderConversationView.bind(this)
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
  getData(options = {}) {
    const data = super.getData(options);

    // Get current time
    const now = new Date();
    const currentTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let templateData = {
      ...data,
      device: this.device,
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
    }
  }

  /**
   * Activate home view listeners
   */
  _activateHomeListeners(html) {
    html.find('.cp-app-icon[data-app="chat7"]').click(this._onChat7Click.bind(this));
  }

  /**
 * Activate Chat7 listeners
 */
  _activateChat7Listeners(html) {
    html.find('.cp-back-button').click(this._onBackClick.bind(this));

    // The template renders contact items, so we need to use event delegation
    html.find('.cp-contact-item').click(this._onContactChatClick.bind(this));
    html.find('.cp-contact-item').on('contextmenu', this._onContactContextMenu.bind(this));

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

    // Get contact data from regular contacts
    let contacts = window.CyberpunkAgent?.instance?.getContactsForDevice(this.device.id) || [];
    let contact = contacts.find(c => c.id === contactId);

    // If not found in regular contacts, check anonymous contacts
    if (!contact) {
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForDevice(this.device.id) || [];
      contact = anonymousContacts.find(c => c.id === contactId);
    }

    if (!contact) {
      ui.notifications.error("Contato não encontrado!");
      return;
    }

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Navigate to conversation view
    this.navigateTo('conversation', contact);
  }

  /**
   * Handle contact context menu
   */
  _onContactContextMenu(event) {
    event.preventDefault();

    const contactId = event.currentTarget.dataset.contactId;

    // Get contact data from regular contacts
    let contacts = window.CyberpunkAgent?.instance?.getContactsForDevice(this.device.id) || [];
    let contact = contacts.find(c => c.id === contactId);

    // If not found in regular contacts, check anonymous contacts
    if (!contact) {
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForDevice(this.device.id) || [];
      contact = anonymousContacts.find(c => c.id === contactId);
    }

    if (contact) {
      this._showContextMenu(event, contact);
    }
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
  _showContactInfo(contactId) {
    // Get contact data
    const contacts = window.CyberpunkAgent?.instance?.getContactsForDevice(this.device.id) || [];
    const contact = contacts.find(c => c.id === contactId);

    if (contact) {
      new Dialog({
        title: "Informações do Contato",
        content: `
          <div class="cp-contact-info-dialog">
            <p><strong>Nome:</strong> ${contact.name}</p>
            <p><strong>Telefone:</strong> ${contact.phoneNumber || 'N/A'}</p>
            <p><strong>Tipo:</strong> Contato Regular</p>
          </div>
        `,
        buttons: {
          close: {
            label: "Fechar"
          }
        }
      }).render(true);
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