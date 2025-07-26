/**
 * Contact Manager Application
 * GM interface for managing contact networks
 */

console.log("Cyberpunk Agent | Loading contact-manager.js...");

/**
 * Contact Manager Menu - Custom settings menu
 * This class creates a custom settings menu for the Contact Manager
 */
class ContactManagerMenu extends FormApplication {
  constructor(options = {}) {
    super({}, options);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "contact-manager-menu",
      classes: ["cyberpunk-agent", "contact-manager-menu"],
      template: "modules/cyberpunk-agent/templates/contact-manager-menu.html",
      width: 400,
      height: 300,
      resizable: true,
      minimizable: true,
      title: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON')
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    return {
      title: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_BUTTON'),
      description: game.i18n.localize('CYBERPUNK_AGENT.SETTINGS.CONTACT_MANAGER_HINT')
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cp-open-contact-manager').click(() => {
      this._openContactManager();
    });
  }

  /**
   * Open the Contact Manager application
   */
  _openContactManager() {
    if (!game.user.isGM) {
      ui.notifications.warn(game.i18n.localize('CYBERPUNK_AGENT.NOTIFICATIONS.GM_ONLY'));
      return;
    }

    const ContactClass = ContactManagerApplication || window.ContactManagerApplication;
    if (typeof ContactClass !== 'undefined') {
      const contactManager = new ContactClass();
      contactManager.render(true);
    } else {
      console.error("Cyberpunk Agent | ContactManagerApplication not loaded!");
      ui.notifications.error("Erro ao carregar o Gerenciador de Contatos. Tente recarregar a página (F5).");
    }
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Not needed for this menu
  }
}

/**
 * Contact Manager Application - GM interface for managing contact networks
 * Extends FormApplication for proper FoundryVTT v11 compatibility
 */
class ContactManagerApplication extends FormApplication {
  constructor(options = {}) {
    super({}, options);
    console.log("ContactManagerApplication constructor called");
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "contact-manager",
      classes: ["cyberpunk-agent", "contact-manager"],
      template: "modules/cyberpunk-agent/templates/contact-manager.html",
      width: 1000,
      height: 800,
      resizable: true,
      minimizable: true,
      title: "Gerenciador de Contatos - Cyberpunk Agent"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    const data = super.getData(options);

    // Get all character actors
    const characterActors = game.actors.filter(actor => actor.type === 'character');

    // Get contact networks for all actors
    const contactNetworks = {};
    characterActors.forEach(actor => {
      let contacts = [];
      try {
        if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
          contacts = window.CyberpunkAgent.instance.getContactsForActor(actor.id) || [];
        }
      } catch (error) {
        console.warn("Cyberpunk Agent | Error getting contacts for actor:", actor.id, error);
      }
      contactNetworks[actor.id] = {
        actor: actor,
        contacts: contacts
      };
    });

    // Calculate total contacts
    const totalContacts = Object.values(contactNetworks).reduce((total, network) => {
      return total + network.contacts.length;
    }, 0);

    return {
      ...data,
      characterActors: characterActors,
      contactNetworks: contactNetworks,
      totalContacts: totalContacts,
      isGM: game.user.isGM
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Add custom event listeners
    html.find('.cp-refresh-contacts').click(this._onRefreshContacts.bind(this));
    html.find('.cp-save-all').click(this._onSaveAll.bind(this));
    html.find('.cp-add-contact-btn').click(this._onAddContactClick.bind(this));
    html.find('.cp-remove-contact').click(this._onRemoveContactClick.bind(this));
    
    // Add filter functionality
    html.find('.cp-search-filter').on('input', this._onFilterInput.bind(this));
  }

  /**
   * Update contact count display
   */
  _updateContactCount(actorId, count) {
    const countElement = this.element.find(`#contact-count-${actorId}`);
    if (countElement.length) {
      countElement.text(`${count} contatos`);
    }
  }

  /**
   * Handle add contact button click
   */
  _onAddContactClick(event) {
    event.preventDefault();
    const actorId = event.currentTarget.dataset.actorId;
    this._showContactSearchModal(actorId);
  }

  /**
   * Handle remove contact button click
   */
  _onRemoveContactClick(event) {
    event.preventDefault();
    const actorId = event.currentTarget.closest('.cp-contact-chip').dataset.actorId;
    const contactId = event.currentTarget.closest('.cp-contact-chip').dataset.contactId;

    if (window.CyberpunkAgent?.instance?.removeContactFromActor(actorId, contactId)) {
      ui.notifications.info(`Contato removido com sucesso!`);
      this.render(true); // Refresh the display
    } else {
      ui.notifications.error("Erro ao remover contato!");
    }
  }

  /**
   * Show contact search modal
   */
  _showContactSearchModal(actorId) {
    const modal = new ContactSearchModal(actorId, this);
    modal.render(true);
  }

  /**
   * Handle filter input
   */
  _onFilterInput(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const networkSections = this.element.find('.cp-network-section');

    if (searchTerm === '') {
      // Show all sections
      networkSections.show();
    } else {
      // Filter sections based on actor name
      networkSections.each((index, section) => {
        const actorName = $(section).find('.cp-actor-details h3').text().toLowerCase();
        if (actorName.includes(searchTerm)) {
          $(section).show();
        } else {
          $(section).hide();
        }
      });
    }
  }

  /**
   * Handle refresh contacts button click
   */
  _onRefreshContacts(event) {
    event.preventDefault();
    this.render(true);
    ui.notifications.info("Redes de contatos atualizadas!");
  }

  /**
   * Handle save all button click
   */
  _onSaveAll(event) {
    event.preventDefault();
    if (window.CyberpunkAgent?.instance?.saveContactNetworks) {
      window.CyberpunkAgent.instance.saveContactNetworks();
      ui.notifications.info("Todas as redes de contatos salvas!");
    } else {
      console.error("Cyberpunk Agent | CyberpunkAgent.instance not available for saving");
      ui.notifications.error("Erro ao salvar redes de contatos!");
    }
  }



  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Handle any form updates if needed
    console.log("Contact manager form updated:", formData);
  }
}

/**
 * Contact Search Modal - Modal for searching and adding contacts
 */
class ContactSearchModal extends FormApplication {
  constructor(actorId, parentApp) {
    super({}, {});
    this.actorId = actorId;
    this.parentApp = parentApp;
    this.searchResults = [];
    this.allContacts = [];
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "contact-search-modal",
      classes: ["cyberpunk-agent", "contact-search-modal"],
      template: "modules/cyberpunk-agent/templates/contact-search-modal.html",
      width: 500,
      height: 600,
      resizable: true,
      minimizable: false,
      title: "Buscar Contatos"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    return {
      actorId: this.actorId
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Load all available contacts
    this._loadAvailableContacts();

    // Add event listeners
    html.find('.cp-search-input').on('input', this._onSearchInput.bind(this));
    html.find('.cp-cancel-search').click(this._onCancel.bind(this));
    
    // Use event delegation for search results
    html.find('.cp-search-results').on('click', '.cp-search-result', this._onResultClick.bind(this));
  }

  /**
   * Load all available contacts
   */
  _loadAvailableContacts() {
    const characterActors = game.actors.filter(actor => actor.type === 'character');
    const currentContacts = window.CyberpunkAgent?.instance?.getContactsForActor(this.actorId) || [];
    const currentContactIds = currentContacts.map(c => c.id);

    // Filter out the current actor and already added contacts
    this.allContacts = characterActors.filter(actor =>
      actor.id !== this.actorId && !currentContactIds.includes(actor.id)
    );

    this._updateSearchResults(this.allContacts);
  }

  /**
   * Handle search input
   */
  _onSearchInput(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (searchTerm === '') {
      this._updateSearchResults(this.allContacts);
    } else {
      const filtered = this.allContacts.filter(actor =>
        actor.name.toLowerCase().includes(searchTerm)
      );
      this._updateSearchResults(filtered);
    }
  }

  /**
   * Update search results display
   */
  _updateSearchResults(results) {
    this.searchResults = results;
    const resultsContainer = this.element.find('.cp-search-results');

    if (results.length === 0) {
      resultsContainer.html('<div class="cp-no-results">Nenhum contato encontrado</div>');
      return;
    }

    const resultsHtml = results.map(actor => `
      <div class="cp-search-result" data-actor-id="${actor.id}">
        <img src="${actor.img}" alt="${actor.name}" class="cp-result-avatar" />
        <span class="cp-result-name">${actor.name}</span>
        <span class="cp-result-type">${actor.type}</span>
      </div>
    `).join('');

    resultsContainer.html(resultsHtml);
  }

  /**
   * Handle result click
   */
  _onResultClick(event) {
    const actorId = event.currentTarget.dataset.actorId;

    if (window.CyberpunkAgent?.instance?.addContactToActor(this.actorId, actorId)) {
      ui.notifications.info(`Contato adicionado com sucesso!`);
      this.close();
      this.parentApp.render(true); // Refresh parent
    } else {
      ui.notifications.error("Erro ao adicionar contato!");
    }
  }

  /**
   * Handle cancel button
   */
  _onCancel(event) {
    event.preventDefault();
    this.close();
  }

  /**
   * Handle form submission
   */
  async _updateObject(event, formData) {
    // Not needed for this modal
  }
}

console.log("Cyberpunk Agent | contact-manager.js loaded successfully");
console.log("Cyberpunk Agent | ContactManagerApplication defined:", typeof ContactManagerApplication);
console.log("Cyberpunk Agent | ContactManagerMenu defined:", typeof ContactManagerMenu);

// Make classes globally available
window.ContactManagerApplication = ContactManagerApplication;
window.ContactManagerMenu = ContactManagerMenu;

console.log("Cyberpunk Agent | ContactManagerApplication and ContactManagerMenu made globally available");

// Simple hook registration
Hooks.once('ready', () => {
  console.log("Cyberpunk Agent | Contact manager ready hook triggered");
  console.log("Cyberpunk Agent | ContactManagerApplication available:", typeof ContactManagerApplication);
}); 