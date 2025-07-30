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
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;
    this.currentView = 'home'; // 'home', 'chat7', 'conversation'
    this.currentContact = null;
    this.views = {
      home: this._renderHomeView.bind(this),
      chat7: this._renderChat7View.bind(this),
      conversation: this._renderConversationView.bind(this)
    };
    console.log("AgentApplication constructor called with:", actor);
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
      actor: this.actor,
      currentTime: currentTime,
      currentView: this.currentView,
      currentContact: this.currentContact
    };

    // Add view-specific data
    if (this.currentView === 'chat7') {
      // Get contacts for the actor
      const contacts = window.CyberpunkAgent?.instance?.getContactsForActor(this.actor.id) || [];
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForActor(this.actor.id) || [];
      const allContacts = [...contacts, ...anonymousContacts];

      // Add unread counts and mute status to contacts
      const contactsWithData = allContacts.map(contact => {
        const unreadCount = window.CyberpunkAgent?.instance?.getUnreadCount(this.actor.id, contact.id) || 0;
        const isMuted = window.CyberpunkAgent?.instance?.isContactMuted(this.actor.id, contact.id) || false;

        return {
          ...contact,
          unreadCount: unreadCount > 0 ? unreadCount : null,
          isMuted: isMuted
        };
      });

      templateData.contacts = contactsWithData;
      templateData.isGM = game.user.isGM;

      console.log("AgentApplication | Template data for Chat7:", {
        contactsCount: contactsWithData.length,
        contacts: contactsWithData
      });
    } else if (this.currentView === 'conversation' && this.currentContact) {
      // Add conversation-specific data
      const messages = window.CyberpunkAgent?.instance?.getMessagesForConversation(this.actor.id, this.currentContact.id) || [];
      templateData.messages = messages;
      templateData.contact = this.currentContact;
    }

    return templateData;
  }

  /**
   * Render the application with the current view
   */
  render(force = false, options = {}) {
    const result = super.render(force, options);

    // After rendering, update the content based on current view
    this._updateViewContent();

    return result;
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
    console.log("AgentApplication | Rendering Chat7 view for actor:", this.actor.name, this.actor.id);

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

    // Mark conversation as read when opening
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.markConversationAsRead(this.actor.id, this.currentContact.id);
    }

    // Get messages for the conversation
    const messages = window.CyberpunkAgent?.instance?.getMessagesForConversation(this.actor.id, this.currentContact.id) || [];
    console.log("AgentApplication | Messages for conversation:", messages.length, messages);

    // Update the messages container
    const messagesContainer = this.element.find('#messages-container');
    console.log("AgentApplication | Messages container found:", messagesContainer.length > 0);

    if (messagesContainer.length) {
      messagesContainer.empty();

      if (messages.length > 0) {
        // Create messages list container
        const messagesList = $('<div class="cp-messages-list"></div>');

        messages.forEach((message, index) => {
          const isOwnMessage = message.senderId === this.actor.id;
          const messageTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          console.log(`AgentApplication | Rendering message ${index + 1}:`, {
            id: message.id,
            text: message.text,
            senderId: message.senderId,
            actorId: this.actor.id,
            isOwn: isOwnMessage,
            time: messageTime
          });

          const messageHtml = `
            <div class="cp-message ${isOwnMessage ? 'own' : 'other'}" data-message-id="${message.id}">
              <div class="cp-message-content">
                <div class="cp-message-text">${message.text}</div>
                <div class="cp-message-time">${messageTime}</div>
              </div>
            </div>
          `;

          messagesList.append(messageHtml);
        });

        messagesContainer.append(messagesList);
      } else {
        // Show no messages message
        const noMessagesHtml = `
          <div class="cp-no-messages">
            <div class="cp-no-messages-icon">
              <i class="fas fa-comments"></i>
            </div>
            <h3>NENHUMA MENSAGEM</h3>
            <p>Inicie uma conversa com ${this.currentContact.name}</p>
          </div>
        `;
        messagesContainer.append(noMessagesHtml);
      }

      console.log("AgentApplication | Conversation view rendered successfully");
    } else {
      console.error("AgentApplication | Messages container not found!");
    }

    // Setup real-time listener for conversation
    this._setupConversationRealtimeListener();
  }

  /**
   * Setup real-time listener for Chat7
   */
  _setupChat7RealtimeListener() {
    // Remove existing listener
    document.removeEventListener('cyberpunk-agent-update', this._chat7UpdateHandler);

    // Create new handler
    this._chat7UpdateHandler = (event) => {
      const { type, senderId, receiverId, message } = event.detail;

      if (type === 'messageUpdate' || type === 'contactUpdate') {
        console.log("AgentApplication | Chat7 received update:", type);
        this._renderChat7View();
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

      if (type === 'messageUpdate' &&
        ((senderId === this.actor.id && receiverId === this.currentContact.id) ||
          (senderId === this.currentContact.id && receiverId === this.actor.id))) {
        console.log("AgentApplication | Conversation received update");
        this._renderConversationView();
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
    console.log("Chat7 app clicked for actor:", this.actor.name);

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

    const isMuted = window.CyberpunkAgent?.instance?.isContactMuted(this.actor.id, contact.id) || false;
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
        <button class="cp-context-menu-item" data-action="info" data-contact-id="${contact.id}">
          <i class="fas fa-info-circle"></i>Informações do Contato
        </button>
      </div>
    `);

    // Add event listeners
    contextMenu.find('[data-action="mute"]').click(() => this._toggleContactMute(contact.id));
    contextMenu.find('[data-action="mark-read"]').click(() => this._markAllMessagesAsRead(contact.id));
    contextMenu.find('[data-action="info"]').click(() => this._showContactInfo(contact.id));

    $('body').append(contextMenu);
  }

  /**
   * Toggle contact mute
   */
  _toggleContactMute(contactId) {
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.toggleContactMute(this.actor.id, contactId);
      this._renderChat7View(); // Refresh the view
    }
  }

  /**
   * Show contact info
   */
  _showContactInfo(contactId) {
    // Get contact data
    let contacts = window.CyberpunkAgent?.instance?.getContactsForActor(this.actor.id) || [];
    let contact = contacts.find(c => c.id === contactId);

    if (!contact) {
      const anonymousContacts = window.CyberpunkAgent?.instance?.getAnonymousContactsForActor(this.actor.id) || [];
      contact = anonymousContacts.find(c => c.id === contactId);
    }

    if (contact) {
      new Dialog({
        title: "Informações do Contato",
        content: `
          <div class="cp-contact-info-dialog">
            <p><strong>Nome:</strong> ${contact.name}</p>
            <p><strong>Telefone:</strong> ${contact.phoneNumber || 'N/A'}</p>
            <p><strong>Tipo:</strong> ${contact.isAnonymous ? 'Contato Anônimo' : 'Contato Regular'}</p>
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
      await window.CyberpunkAgent.instance.markConversationAsRead(this.actor.id, contactId);
      ui.notifications.info("Todas as mensagens foram marcadas como lidas!");
      this._renderChat7View(); // Refresh the view
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

    if (!text || !this.currentContact) {
      return;
    }

    // Clear input
    input.val('');

    // Send message through CyberpunkAgent
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      try {
        await window.CyberpunkAgent.instance.sendMessage(this.actor.id, this.currentContact.id, text);
        console.log("Cyberpunk Agent | Message sent successfully");

        // Update the conversation view immediately to show the new message
        this._renderConversationView();
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
  constructor(actor, options = {}) {
    super(actor, options);
    this.currentView = 'home';
  }
}

class Chat7Application extends AgentApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.currentView = 'chat7';
  }
}

class ChatConversationApplication extends AgentApplication {
  constructor(actor, contact, options = {}) {
    super(actor, options);
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