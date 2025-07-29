/**
 * Agent Home Application
 * The main interface for the Cyberpunk Agent
 */

console.log("Cyberpunk Agent | Loading agent-home.js...");

/**
 * Agent Home Application - Main interface for the Cyberpunk Agent
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class AgentHomeApplication extends FormApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;
    console.log("AgentHomeApplication constructor called with:", actor);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "agent-home",
      classes: ["cyberpunk-agent", "agent-home"],
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

    return {
      ...data,
      actor: this.actor,
      currentTime: currentTime
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners for app icons
    html.find('.cp-app-icon[data-app="chat7"]').click(this._onChat7Click.bind(this));
  }

  /**
   * Handle Chat7 app click
   */
  _onChat7Click(event) {
    event.preventDefault();
    console.log("Chat7 app clicked for actor:", this.actor.name);

    // Close the current application
    this.close();

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Open Chat7 application
    const ChatClass = Chat7Application || window.Chat7Application;
    if (typeof ChatClass !== 'undefined') {
      const chat7 = new ChatClass(this.actor);
      chat7.render(true);
    } else {
      console.error("Cyberpunk Agent | Chat7Application not loaded!");
      ui.notifications.error("Erro ao carregar o Chat7. Tente recarregar a página (F5).");
    }
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Agent home form updated:", formData);
  }
}

/**
 * Chat7 Application - Chat interface for the Cyberpunk Agent
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class Chat7Application extends FormApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;
    console.log("Chat7Application constructor called with:", actor);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "chat7",
      classes: ["cyberpunk-agent", "chat7"],
      template: "modules/cyberpunk-agent/templates/chat7.html",
      width: 400,
      height: 700,
      resizable: true,
      minimizable: true,
      title: "Chat7"
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

    // Get contacts for this actor
    let contacts = [];
    try {
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        contacts = window.CyberpunkAgent.instance.getContactsForActor(this.actor.id) || [];

        // Get anonymous contacts (people who sent messages but aren't in contact list)
        const anonymousContacts = window.CyberpunkAgent.instance.getAnonymousContactsForActor(this.actor.id) || [];

        // Combine regular contacts with anonymous contacts
        contacts = [...contacts, ...anonymousContacts];
      }
    } catch (error) {
      console.warn("Cyberpunk Agent | Error getting contacts:", error);
    }

    return {
      ...data,
      actor: this.actor,
      currentTime: currentTime,
      contacts: contacts,
      isGM: game.user.isGM
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-contact-item').click(this._onContactChatClick.bind(this));

    // Add context menu for contact items
    html.find('.cp-contact-item').on('contextmenu', this._onContactContextMenu.bind(this));

    // Close context menu when clicking outside
    $(document).on('click', this._onDocumentClick.bind(this));
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

    // Close the current application
    this.close();

    // Reopen the Agent Home
    const AgentClass = AgentHomeApplication || window.AgentHomeApplication;
    if (typeof AgentClass !== 'undefined') {
      const agentHome = new AgentClass(this.actor);
      agentHome.render(true);
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
    let contacts = window.CyberpunkAgent?.instance?.getContactsForActor(this.actor.id) || [];
    let contact = contacts.find(c => c.id === contactId);

    // If not found in regular contacts, check anonymous contacts
    if (!contact) {
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForActor(this.actor.id) || [];
      contact = anonymousContacts.find(c => c.id === contactId);
    }

    if (!contact) {
      ui.notifications.error("Contato não encontrado!");
      return;
    }

    // Close the current application
    this.close();

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    // Open Chat Conversation application
    const ChatConversationClass = ChatConversationApplication || window.ChatConversationApplication;
    if (typeof ChatConversationClass !== 'undefined') {
      const chatConversation = new ChatConversationClass(this.actor, contact);
      chatConversation.render(true);
    } else {
      console.error("Cyberpunk Agent | ChatConversationApplication not loaded!");
      ui.notifications.error("Erro ao carregar o chat. Tente recarregar a página (F5).");
    }
  }

  /**
   * Handle contact context menu
   */
  _onContactContextMenu(event) {
    event.preventDefault();

    const contactId = event.currentTarget.dataset.contactId;

    // Get contact data from regular contacts
    let contacts = window.CyberpunkAgent?.instance?.getContactsForActor(this.actor.id) || [];
    let contact = contacts.find(c => c.id === contactId);

    // If not found in regular contacts, check anonymous contacts
    if (!contact) {
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForActor(this.actor.id) || [];
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

    // Check if contact is muted
    const isMuted = window.CyberpunkAgent?.instance?.isContactMuted(this.actor.id, contact.id) || false;

    // Check if user has access to this actor
    const userActors = window.CyberpunkAgent?.instance?.getUserActors() || [];
    const hasAccess = userActors.some(actor => actor.id === this.actor.id);

    // Create context menu
    const menu = $(`
      <div class="cp-context-menu">
        <button class="cp-context-menu-item ${isMuted ? 'muted' : ''} ${!hasAccess ? 'disabled' : ''}" data-action="mute" data-contact-id="${contact.id}">
          <i class="fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
          ${isMuted ? 'Desmutar Notificações' : 'Mutar Notificações'}
          ${!hasAccess ? ' (Sem Acesso)' : ''}
        </button>
        <div class="cp-context-menu-separator"></div>
        <button class="cp-context-menu-item" data-action="info" data-contact-id="${contact.id}">
          <i class="fas fa-info-circle"></i>
          Informações do Contato
        </button>
      </div>
    `);

    // Position menu
    menu.css({
      left: event.pageX + 5,
      top: event.pageY - 5
    });

    // Add to document
    $('body').append(menu);

    // Add event listeners
    menu.find('.cp-context-menu-item').click((e) => {
      e.stopPropagation();
      const action = e.currentTarget.dataset.action;
      const contactId = e.currentTarget.dataset.contactId;

      // Check if item is disabled
      if (e.currentTarget.classList.contains('disabled')) {
        return; // Don't process disabled items
      }

      if (action === 'mute') {
        this._toggleContactMute(contactId);
      } else if (action === 'info') {
        this._showContactInfo(contactId);
      }

      menu.remove();
    });

    // Store reference to close on document click
    this.currentContextMenu = menu;
  }

  /**
 * Toggle contact mute status
 */
  _toggleContactMute(contactId) {
    if (window.CyberpunkAgent?.instance) {
      const isMuted = window.CyberpunkAgent.instance.toggleContactMute(this.actor.id, contactId);

      // Check if the operation was successful (not blocked by permissions)
      if (isMuted !== false) {
        // Show notification
        const contacts = window.CyberpunkAgent.instance.getContactsForActor(this.actor.id) || [];
        const contact = contacts.find(c => c.id === contactId);
        const contactName = contact ? contact.name : 'Contato';

        if (isMuted) {
          ui.notifications.info(`🔇 Notificações de ${contactName} mutadas`);
        } else {
          ui.notifications.info(`🔊 Notificações de ${contactName} desmutadas`);
        }

        // Play sound effect
        window.CyberpunkAgent.instance.playSoundEffect('closing-window');
      }
      // If isMuted is false, the function already showed a warning notification
    }
  }

  /**
   * Show contact information
   */
  _showContactInfo(contactId) {
    const contacts = window.CyberpunkAgent.instance.getContactsForActor(this.actor.id) || [];
    const contact = contacts.find(c => c.id === contactId);

    if (contact) {
      const isMuted = window.CyberpunkAgent?.instance?.isContactMuted(this.actor.id, contact.id) || false;

      const info = `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 10px 0; color: var(--cp-text);">${contact.name}</h3>
          <p style="margin: 5px 0; color: var(--cp-text-dim);">
            <strong>Status:</strong> ${isMuted ? '🔇 Mutado' : '🔊 Ativo'}
          </p>
          <p style="margin: 5px 0; color: var(--cp-text-dim);">
            <strong>Tipo:</strong> ${contact.isAnonymous ? 'Anônimo' : 'Contato Regular'}
          </p>
        </div>
      `;

      new Dialog({
        title: `Informações de ${contact.name}`,
        content: info,
        buttons: {
          close: {
            label: "Fechar",
            callback: () => { }
          }
        }
      }).render(true);
    }
  }

  /**
   * Handle document click to close context menu
   */
  _onDocumentClick(event) {
    if (this.currentContextMenu && !$(event.target).closest('.cp-context-menu').length) {
      this.currentContextMenu.remove();
      this.currentContextMenu = null;
    }
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Chat7 form updated:", formData);
  }
}

/**
 * Chat Conversation Application - Individual chat between two characters
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class ChatConversationApplication extends FormApplication {
  constructor(actor, contact, options = {}) {
    super(actor, options);
    this.actor = actor;
    this.contact = contact;
    console.log("ChatConversationApplication constructor called with:", actor.name, "and", contact.name);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "chat-conversation",
      classes: ["cyberpunk-agent", "chat-conversation"],
      template: "modules/cyberpunk-agent/templates/chat-conversation.html",
      width: 400,
      height: 700,
      resizable: true,
      minimizable: true,
      title: "Chat"
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

    // Get messages for this conversation
    let messages = [];
    try {
      if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
        messages = window.CyberpunkAgent.instance.getMessagesForConversation(this.actor.id, this.contact.id) || [];
      }
    } catch (error) {
      console.warn("Cyberpunk Agent | Error getting messages:", error);
    }



    return {
      ...data,
      actor: this.actor,
      contact: this.contact,
      currentTime: currentTime,
      messages: messages,
      isGM: game.user.isGM
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners
    html.find('.cp-back-button').click(this._onBackClick.bind(this));
    html.find('.cp-send-message').click(this._onSendMessage.bind(this));
    html.find('.cp-message-input').on('keypress', this._onMessageInputKeypress.bind(this));

    // GM-only message delete
    if (game.user.isGM) {
      html.find('.cp-message-delete').click(this._onDeleteMessage.bind(this));
    }

    // Scroll to bottom of messages
    this._scrollToBottom();

    // Listen for real-time updates
    this._setupRealtimeListener();
  }

  /**
   * Setup real-time update listener
   */
  _setupRealtimeListener() {
    // Listen for custom events from the module
    document.addEventListener('cyberpunk-agent-update', (event) => {
      if (event.detail && event.detail.type === 'messageUpdate') {
        // Always scroll to bottom on new message
        this._scrollToBottomOnNewMessage();
      }
    });

    // Also listen for window focus to scroll to bottom
    window.addEventListener('focus', () => {
      setTimeout(() => {
        this._autoScrollIfAtBottom();
      }, 100);
    });
  }

  /**
 * Handle delete message button click
 */
  async _onDeleteMessage(event) {
    event.preventDefault();

    const messageId = event.currentTarget.dataset.messageId;
    if (!messageId) {
      console.error("Cyberpunk Agent | No message ID found");
      return;
    }

    // Show confirmation dialog using Foundry's Dialog
    const confirmed = await new Dialog({
      title: "Confirmar Deleção",
      content: "Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.",
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Deletar",
          callback: async () => {
            try {
              // Delete message through CyberpunkAgent
              if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
                const success = await window.CyberpunkAgent.instance.deleteMessages(
                  this.actor.id,
                  this.contact.id,
                  [messageId]
                );

                if (success) {
                  // Use the correct notification method
                  ui.notifications.info("Mensagem deletada com sucesso!");

                  // Don't re-render here - let the notification system handle it
                  // The message will be removed when the deletion notification is processed
                } else {
                  ui.notifications.warn("Erro ao deletar mensagem!");
                }
              } else {
                ui.notifications.warn("Sistema Cyberpunk Agent não disponível!");
              }
            } catch (error) {
              console.error("Cyberpunk Agent | Error deleting message:", error);
              ui.notifications.warn("Erro ao deletar mensagem: " + error.message);
            }
            return true;
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
          callback: () => false
        }
      },
      default: "no"
    }).render(true);

    // The deletion is now handled inside the dialog callback
    // No need to check confirmed here anymore
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

    // Close the current application
    this.close();

    // Reopen the Chat7
    const ChatClass = Chat7Application || window.Chat7Application;
    if (typeof ChatClass !== 'undefined') {
      const chat7 = new ChatClass(this.actor);
      chat7.render(true);
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
   * Handle message input keypress (Enter to send)
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

    if (!text) {
      return;
    }

    // Clear input
    input.val('');

    // Send message through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      try {
        await window.CyberpunkAgent.instance.sendMessage(this.actor.id, this.contact.id, text);
        console.log("Cyberpunk Agent | Message sent successfully");
      } catch (error) {
        console.error("Cyberpunk Agent | Error sending message:", error);
        ui.notifications.error("Erro ao enviar mensagem: " + error.message);
      }
    }

    // Note: The interface will be updated automatically via real-time updates
    // No need to manually re-render here
  }

  /**
   * Scroll to bottom of messages
   */
  _scrollToBottom() {
    const messagesContainer = this.element.find('#messages-container');
    if (messagesContainer.length) {
      // Use smooth scrolling for better UX
      messagesContainer[0].scrollTo({
        top: messagesContainer[0].scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Scroll to bottom immediately (without smooth animation)
   */
  _scrollToBottomImmediate() {
    const messagesContainer = this.element.find('#messages-container');
    if (messagesContainer.length) {
      messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
    }
  }

  /**
   * Check if user is at bottom of messages
   */
  _isAtBottom() {
    const messagesContainer = this.element.find('#messages-container');
    if (messagesContainer.length) {
      const container = messagesContainer[0];
      const threshold = 50; // pixels from bottom
      return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
    }
    return true;
  }

  /**
   * Auto-scroll to bottom if user is already at bottom
   */
  _autoScrollIfAtBottom() {
    if (this._isAtBottom()) {
      this._scrollToBottom();
    }
  }

  /**
   * Scroll to bottom on new message (always)
   */
  _scrollToBottomOnNewMessage() {
    // Always scroll to bottom when a new message is added
    setTimeout(() => {
      this._scrollToBottom();
    }, 100);
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Chat conversation form updated:", formData);
  }
}

console.log("Cyberpunk Agent | agent-home.js loaded successfully");
console.log("Cyberpunk Agent | AgentHomeApplication defined:", typeof AgentHomeApplication);
console.log("Cyberpunk Agent | Chat7Application defined:", typeof Chat7Application);
console.log("Cyberpunk Agent | ChatConversationApplication defined:", typeof ChatConversationApplication);

// Make classes globally available
window.AgentHomeApplication = AgentHomeApplication;
window.Chat7Application = Chat7Application;
window.ChatConversationApplication = ChatConversationApplication;

console.log("Cyberpunk Agent | Classes made globally available"); 