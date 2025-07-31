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

    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
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
    this.lastUpdateTime = Date.now();
    this.currentFilterTerm = ''; // Store current filter term
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
    html.find('.cp-add-contact-btn').click(this._onAddContactClick.bind(this));
    html.find('.cp-remove-contact').click(this._onRemoveContactClick.bind(this));

    // Add filter functionality
    html.find('.cp-search-filter').on('input', this._onFilterInput.bind(this));

    // Restore filter state if there was a previous filter
    this._restoreFilterState();

    // Listen for real-time updates
    this._setupRealtimeListener();
  }

  /**
   * Setup real-time update listener
   */
  _setupRealtimeListener() {
    // Listen for custom events from the module
    document.addEventListener('cyberpunk-agent-update', () => {
      console.log("ContactManagerApplication | Received real-time update event");
      this._handleRealtimeUpdate();
    });

    // Also listen for window focus to refresh data
    window.addEventListener('focus', () => {
      this._handleRealtimeUpdate();
    });
  }

  /**
   * Handle real-time updates
   */
  _handleRealtimeUpdate() {
    const now = Date.now();
    // Prevent too frequent updates (minimum 1 second between updates)
    if (now - this.lastUpdateTime < 1000) {
      return;
    }
    this.lastUpdateTime = now;

    console.log("ContactManagerApplication | Handling real-time update");

    // Store current filter state before updating
    this._storeFilterState();

    // Try to update only the contact data first (more efficient)
    if (this._updateContactDataOnly()) {
      console.log("ContactManagerApplication | Updated contact data only");
    } else {
      // Fallback to full re-render if partial update fails
      console.log("ContactManagerApplication | Falling back to full re-render");
      this.render(true);
    }
  }

  /**
   * Update only contact data without full re-render
   */
  _updateContactDataOnly() {
    try {
      // Get updated contact data
      const characterActors = game.actors.filter(actor => actor.type === 'character');
      let hasChanges = false;

      characterActors.forEach(actor => {
        const currentContacts = window.CyberpunkAgent?.instance?.getContactsForActor(actor.id) || [];
        const contactCountElement = this.element.find(`#contact-count-${actor.id}`);
        const contactsContainer = this.element.find(`#selected-contacts-${actor.id}`);
        const noContactsElement = this.element.find(`#no-contacts-${actor.id}`);

        if (contactCountElement.length) {
          const newCount = currentContacts.length;
          const currentCountText = contactCountElement.text();
          const expectedCountText = `${newCount} contatos`;

          if (currentCountText !== expectedCountText) {
            contactCountElement.text(expectedCountText);
            hasChanges = true;
          }
        }

        // Update contacts display
        if (contactsContainer.length) {
          if (currentContacts.length > 0) {
            // Generate new contacts HTML
            const contactsHtml = currentContacts.map(contact => `
              <div class="cp-contact-chip" data-contact-id="${contact.id}" data-actor-id="${actor.id}">
                <img src="${contact.img}" alt="${contact.name}" class="cp-chip-avatar" />
                <span class="cp-chip-name">${contact.name}</span>
                <button class="cp-remove-contact" title="Remover ${contact.name}">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `).join('');

            const newContactsHtml = `
              <div class="cp-contacts-chips">
                ${contactsHtml}
              </div>
            `;

            // Check if content actually changed
            const currentContent = contactsContainer.html();
            if (currentContent !== newContactsHtml) {
              contactsContainer.html(newContactsHtml);
              hasChanges = true;
            }

            // Hide no-contacts message if it exists
            if (noContactsElement.length) {
              noContactsElement.hide();
            }
          } else {
            // Show no-contacts message
            const noContactsHtml = `
              <div class="cp-no-contacts" id="no-contacts-${actor.id}">
                <p>Nenhum contato configurado para este personagem.</p>
              </div>
            `;

            const currentContent = contactsContainer.html();
            if (currentContent !== noContactsHtml) {
              contactsContainer.html(noContactsHtml);
              hasChanges = true;
            }
          }
        }
      });

      // Re-attach event listeners for new contact chips
      if (hasChanges) {
        this._reattachContactEventListeners();
      }

      // Restore filter state after partial update
      this._restoreFilterStateAfterPartialUpdate();

      return true;
    } catch (error) {
      console.warn("ContactManagerApplication | Error in partial update:", error);
      return false;
    }
  }

  /**
   * Re-attach event listeners for contact chips after partial update
   */
  _reattachContactEventListeners() {
    // Re-attach remove contact event listeners
    this.element.find('.cp-remove-contact').off('click').on('click', this._onRemoveContactClick.bind(this));

    console.log("ContactManagerApplication | Re-attached contact event listeners");
  }

  /**
   * Store current filter state
   */
  _storeFilterState() {
    const filterInput = this.element.find('.cp-search-filter');
    if (filterInput.length) {
      this.currentFilterTerm = filterInput.val() || '';
      console.log("ContactManagerApplication | Stored filter term:", this.currentFilterTerm);
    }
  }

  /**
 * Restore filter state after re-render
 */
  _restoreFilterState() {
    if (this.currentFilterTerm) {
      const filterInput = this.element.find('.cp-search-filter');
      if (filterInput.length) {
        // Set the input value
        filterInput.val(this.currentFilterTerm);

        // Reapply the filter
        this._applyFilter(this.currentFilterTerm);

        console.log("ContactManagerApplication | Restored filter term:", this.currentFilterTerm);
      }
    }
  }

  /**
   * Restore filter state after partial update
   */
  _restoreFilterStateAfterPartialUpdate() {
    if (this.currentFilterTerm) {
      // Reapply the filter without changing the input value
      this._applyFilter(this.currentFilterTerm);

      console.log("ContactManagerApplication | Restored filter after partial update:", this.currentFilterTerm);
    }
  }

  /**
   * Apply filter to network sections
   */
  _applyFilter(searchTerm) {
    const networkSections = this.element.find('.cp-network-section');

    if (searchTerm === '') {
      // Show all sections
      networkSections.show();
    } else {
      // Filter sections based on actor name
      networkSections.each((index, section) => {
        const actorName = $(section).find('.cp-actor-details h3').text().toLowerCase();
        if (actorName.includes(searchTerm.toLowerCase())) {
          $(section).show();
        } else {
          $(section).hide();
        }
      });
    }
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
    const contactName = event.currentTarget.closest('.cp-contact-chip').querySelector('.cp-chip-name').textContent;

    // Add visual feedback immediately
    const contactChip = event.currentTarget.closest('.cp-contact-chip');
    contactChip.style.opacity = '0.5';
    contactChip.style.transform = 'scale(0.95)';

    if (window.CyberpunkAgent?.instance?.removeContactFromActor(actorId, contactId)) {
      // Show success notification
      ui.notifications.info(`Contato "${contactName}" removido com sucesso!`);

      // The real-time update system will handle the refresh automatically
      // But we can also provide immediate visual feedback
      setTimeout(() => {
        this._handleRealtimeUpdate();
      }, 100);
    } else {
      // Restore visual state on error
      contactChip.style.opacity = '1';
      contactChip.style.transform = 'scale(1)';
      ui.notifications.error("Erro ao remover contato!");
    }
  }

  /**
   * Show contact search modal
   */
  _showContactSearchModal(actorId) {
    // Play opening sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('opening-window');
    }

    const modal = new ContactSearchModal(actorId, this);
    modal.render(true);
  }

  /**
   * Handle filter input
   */
  _onFilterInput(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.currentFilterTerm = event.target.value; // Store the original value (not trimmed)

    this._applyFilter(searchTerm);
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
        <div class="cp-result-avatar">
          <img src="${actor.img}" alt="${actor.name}" />
        </div>
        <div class="cp-result-info">
          <div class="cp-result-name">${actor.name}</div>
          <div class="cp-result-type">${actor.type}</div>
        </div>
      </div>
    `).join('');

    resultsContainer.html(resultsHtml);
  }

  /**
   * Handle result click
   */
  _onResultClick(event) {
    const actorId = event.currentTarget.dataset.actorId;
    const actorName = event.currentTarget.querySelector('.cp-result-name').textContent;

    // Add visual feedback immediately
    const resultElement = event.currentTarget;
    resultElement.style.opacity = '0.5';
    resultElement.style.transform = 'scale(0.95)';

    try {
      // Check if CyberpunkAgent instance is available
      if (!window.CyberpunkAgent?.instance) {
        throw new Error("CyberpunkAgent instance not available");
      }

      // Check if addContactToActor method exists
      if (typeof window.CyberpunkAgent.instance.addContactToActor !== 'function') {
        throw new Error("addContactToActor method not available");
      }

      const success = window.CyberpunkAgent.instance.addContactToActor(this.actorId, actorId);

      if (success) {
        // Show success notification
        ui.notifications.info(`Contato "${actorName}" adicionado com sucesso!`);

        // Play closing sound effect
        if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
          window.CyberpunkAgent.instance.playSoundEffect('closing-window');
        }

        this.close();

        // The real-time update system will handle the refresh automatically
        // But we can also provide immediate feedback to the parent app
        if (this.parentApp && this.parentApp._handleRealtimeUpdate) {
          setTimeout(() => {
            this.parentApp._handleRealtimeUpdate();
          }, 100);
        }
      } else {
        // Restore visual state on error
        resultElement.style.opacity = '1';
        resultElement.style.transform = 'scale(1)';
        ui.notifications.error("Erro ao adicionar contato! Verifique se você tem permissão de GM.");
      }
    } catch (error) {
      // Restore visual state on error
      resultElement.style.opacity = '1';
      resultElement.style.transform = 'scale(1)';

      console.error("Cyberpunk Agent | Error adding contact:", error);
      ui.notifications.error(`Erro ao adicionar contato: ${error.message}`);
    }
  }

  /**
   * Handle cancel button
   */
  _onCancel(event) {
    event.preventDefault();

    // Play closing sound effect
    if (window.CyberpunkAgent && window.CyberpunkAgent.instance) {
      window.CyberpunkAgent.instance.playSoundEffect('closing-window');
    }

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

/**
 * GM Data Management Menu
 * Provides buttons for GM to clear all messages and contacts
 */
class GMDataManagementMenu extends FormApplication {
  constructor(options = {}) {
    super(options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'gm-data-management-menu',
      template: 'modules/cyberpunk-agent/templates/gm-data-management.html',
      title: 'GM Data Management',
      width: 400,
      height: 300,
      resizable: true,
      closeOnSubmit: false
    });
  }

  getData(options = {}) {
    return {
      canManage: game.user.isGM
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.clear-all-messages').on('click', this._onClearAllMessages.bind(this));
    html.find('.clear-all-contacts').on('click', this._onClearAllContacts.bind(this));
  }

  async _onClearAllMessages(event) {
    event.preventDefault();

    if (!game.user.isGM) {
      ui.notifications.error("Only GMs can clear all messages");
      return;
    }

    const confirmed = await new Promise((resolve) => {
      new Dialog({
        title: "Clear All Messages",
        content: `
          <p><strong>Warning:</strong> This will delete ALL chat message histories for ALL actors.</p>
          <p>This action cannot be undone.</p>
          <p>Are you sure you want to proceed?</p>
        `,
        buttons: {
          yes: {
            label: "Yes, Clear All Messages",
            callback: () => resolve(true)
          },
          no: {
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "no"
      }).render(true);
    });

    if (confirmed) {
      try {
        if (window.CyberpunkAgent?.instance?.clearAllMessages) {
          await window.CyberpunkAgent.instance.clearAllMessages();
          ui.notifications.info("All chat message histories have been cleared successfully!");
        } else {
          throw new Error("clearAllMessages method not available");
        }
      } catch (error) {
        console.error("Cyberpunk Agent | Error clearing all messages:", error);
        ui.notifications.error(`Error clearing all messages: ${error.message}`);
      }
    }
  }

  async _onClearAllContacts(event) {
    event.preventDefault();

    if (!game.user.isGM) {
      ui.notifications.error("Only GMs can clear all contacts");
      return;
    }

    const confirmed = await new Promise((resolve) => {
      new Dialog({
        title: "Clear All Contacts",
        content: `
          <p><strong>Warning:</strong> This will delete ALL contact connections for ALL actors.</p>
          <p>This will also delete ALL chat message histories.</p>
          <p>This action cannot be undone.</p>
          <p>Are you sure you want to proceed?</p>
        `,
        buttons: {
          yes: {
            label: "Yes, Clear All Contacts",
            callback: () => resolve(true)
          },
          no: {
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "no"
      }).render(true);
    });

    if (confirmed) {
      try {
        if (window.CyberpunkAgent?.instance?.clearAllContacts) {
          await window.CyberpunkAgent.instance.clearAllContacts();
          ui.notifications.info("All contact connections and messages have been cleared successfully!");
        } else {
          throw new Error("clearAllContacts method not available");
        }
      } catch (error) {
        console.error("Cyberpunk Agent | Error clearing all contacts:", error);
        ui.notifications.error(`Error clearing all contacts: ${error.message}`);
      }
    }
  }

  async _updateObject(event, formData) {
    // Not needed for this menu
  }
}

// Make classes globally available
window.ContactManagerApplication = ContactManagerApplication;
window.ContactManagerMenu = ContactManagerMenu;
window.GMDataManagementMenu = GMDataManagementMenu;

console.log("Cyberpunk Agent | ContactManagerApplication, ContactManagerMenu, and GMDataManagementMenu made globally available");

// Simple hook registration
Hooks.once('ready', () => {
  console.log("Cyberpunk Agent | Contact manager ready hook triggered");
  console.log("Cyberpunk Agent | ContactManagerApplication available:", typeof ContactManagerApplication);
  console.log("Cyberpunk Agent | GMDataManagementMenu available:", typeof GMDataManagementMenu);
}); 