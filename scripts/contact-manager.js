/**
 * Contact Manager Application
 * GM interface for managing contact networks
 */

console.log("Cyberpunk Agent | Loading contact-manager.js...");

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
      width: 900,
      height: 700,
      resizable: true,
      minimizable: true,
      title: "Contact Network Manager"
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
    html.find('.cp-add-contact').click(this._onAddContact.bind(this));
    html.find('.cp-remove-contact').click(this._onRemoveContact.bind(this));
    html.find('.cp-refresh-contacts').click(this._onRefreshContacts.bind(this));
  }

  /**
   * Handle add contact button click
   */
  _onAddContact(event) {
    event.preventDefault();
    const actorId = event.currentTarget.dataset.actorId;
    this._showAddContactDialog(actorId);
  }

  /**
   * Handle remove contact button click
   */
  _onRemoveContact(event) {
    event.preventDefault();
    const actorId = event.currentTarget.dataset.actorId;
    const contactId = event.currentTarget.dataset.contactId;

    if (CyberpunkAgent.instance?.removeContactFromActor(actorId, contactId)) {
      ui.notifications.info("Contact removed successfully!");
      this.render(true);
    } else {
      ui.notifications.error("Failed to remove contact!");
    }
  }

  /**
   * Handle refresh contacts button click
   */
  _onRefreshContacts(event) {
    event.preventDefault();
    this.render(true);
    ui.notifications.info("Contact networks refreshed!");
  }

  /**
   * Show dialog to add a contact
   */
  async _showAddContactDialog(actorId) {
    const actor = game.actors.get(actorId);
    if (!actor) return;

    // Get available character actors that aren't already contacts
    const existingContacts = CyberpunkAgent.instance?.getContactsForActor(actorId) || [];
    const existingContactIds = existingContacts.map(c => c.id);

    const availableActors = game.actors.filter(a =>
      a.type === 'character' &&
      a.id !== actorId &&
      !existingContactIds.includes(a.id)
    );

    if (availableActors.length === 0) {
      ui.notifications.warn("No available actors to add as contacts!");
      return;
    }

    const actorOptions = availableActors.map(a => ({
      label: a.name,
      value: a.id
    }));

    const selectedActorId = await new Promise((resolve) => {
      new Dialog({
        title: `Add Contact to ${actor.name}`,
        content: `
                    <form>
                        <div class="form-group">
                            <label>Select actor to add as contact:</label>
                            <select id="contact-select">
                                ${actorOptions.map(option =>
          `<option value="${option.value}">${option.label}</option>`
        ).join('')}
                            </select>
                        </div>
                    </form>
                `,
        buttons: {
          confirm: {
            label: "Add Contact",
            callback: (html) => {
              const contactId = html.find('#contact-select').val();
              resolve(contactId);
            }
          },
          cancel: {
            label: "Cancel"
          }
        }
      }).render(true);
    });

    if (selectedActorId && CyberpunkAgent.instance?.addContactToActor(actorId, selectedActorId)) {
      ui.notifications.info("Contact added successfully!");
      this.render(true);
    } else {
      ui.notifications.error("Failed to add contact!");
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

console.log("Cyberpunk Agent | contact-manager.js loaded successfully");
console.log("Cyberpunk Agent | ContactManagerApplication defined:", typeof ContactManagerApplication);

// Make class globally available
window.ContactManagerApplication = ContactManagerApplication;

console.log("Cyberpunk Agent | ContactManagerApplication made globally available");

// Simple hook registration
Hooks.once('ready', () => {
  console.log("Cyberpunk Agent | Contact manager ready hook triggered");
  console.log("Cyberpunk Agent | ContactManagerApplication available:", typeof ContactManagerApplication);
}); 