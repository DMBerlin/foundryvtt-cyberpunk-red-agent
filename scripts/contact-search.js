/**
 * Contact Search Modal
 * Handles adding contacts by phone number
 */

console.log("Cyberpunk Agent | Loading contact-search.js...");

/**
 * Contact Search Modal Application
 */
class ContactSearchModal extends Application {
  constructor(actorId, options = {}) {
    super(options);
    this.actorId = actorId;
    this.phoneNumber = '';
    this.searchResult = null;
    this.isSearching = false;
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "contact-search-modal",
      classes: ["contact-search-modal"],
      template: "modules/cyberpunk-agent/templates/contact-search-modal.html",
      width: 500,
      height: 400,
      resizable: false,
      minimizable: false,
      title: "Adicionar Contato"
    });
  }

  /**
   * Get data for the template
   */
  getData(options = {}) {
    return {
      actorId: this.actorId,
      phoneNumber: this.phoneNumber,
      searchResult: this.searchResult,
      isSearching: this.isSearching
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Phone input
    const phoneInput = html.find('.cpa-phone-input');
    phoneInput.on('input', this._onPhoneInput.bind(this));
    phoneInput.on('keypress', this._onPhoneKeypress.bind(this));

    // Search button
    const searchBtn = html.find('[data-action="search"]');
    searchBtn.on('click', this._onSearchClick.bind(this));

    // Add contact button
    const addContactBtn = html.find('[data-action="add-contact"]');
    addContactBtn.on('click', this._onAddContactClick.bind(this));

    // Close button
    const closeBtn = html.find('[data-action="close"]');
    closeBtn.on('click', this._onCloseClick.bind(this));

    // Modal close button
    const modalCloseBtn = html.find('.cpa-modal-close');
    modalCloseBtn.on('click', this._onCloseClick.bind(this));
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
    this.phoneNumber = rawValue;
    this._updateSearchButton();
    this._clearResults();
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
    if (!this.phoneNumber.trim()) {
      this._showError('Digite um número de telefone');
      return;
    }

    this.isSearching = true;
    this._updateUI();

    try {
      // Get the first device for this actor
      const devices = window.CyberpunkAgent?.instance?.getDevicesForActor(this.actorId) || [];
      if (devices.length === 0) {
        this._showError('Nenhum dispositivo encontrado para este personagem');
        return;
      }

      const deviceId = devices[0];

      // Normalize the phone number before searching
      const normalizedPhone = window.CyberpunkAgent?.instance?.normalizePhoneNumber(this.phoneNumber);

      // Search for the phone number
      const contactDeviceId = window.CyberpunkAgent?.instance?.getDeviceIdFromPhoneNumber(normalizedPhone);

      if (!contactDeviceId) {
        const displayNumber = window.CyberpunkAgent?.instance?.formatPhoneNumberForDisplay(normalizedPhone) || normalizedPhone;
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
      if (contactDeviceId === deviceId) {
        this._showError('Você não pode adicionar seu próprio número aos contatos');
        return;
      }

      // Check if already a contact
      const isAlreadyContact = window.CyberpunkAgent?.instance?.isDeviceContact(deviceId, contactDeviceId);
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

      this.searchResult = {
        deviceId: contactDeviceId,
        name: ownerName,
        img: deviceAvatar,
        phoneNumber: normalizedPhone,
        displayPhoneNumber: window.CyberpunkAgent?.instance?.formatPhoneNumberForDisplay(normalizedPhone) || normalizedPhone
      };

      this._showResult();

    } catch (error) {
      console.error('ContactSearchModal | Error searching for contact:', error);
      this._showError('Erro ao buscar contato');
    } finally {
      this.isSearching = false;
      this._updateUI();
    }
  }

  /**
   * Handle add contact button click
   */
  async _onAddContactClick() {
    if (!this.searchResult) {
      return;
    }

    try {
      // Get the first device for this actor
      const devices = window.CyberpunkAgent?.instance?.getDevicesForActor(this.actorId) || [];
      if (devices.length === 0) {
        this._showError('Nenhum dispositivo encontrado para este personagem');
        return;
      }

      const deviceId = devices[0];

      // Add contact by phone number
      const result = window.CyberpunkAgent?.instance?.addContactByPhoneNumber(deviceId, this.searchResult.phoneNumber);

      if (result && result.success) {
        // Show success notification
        ui.notifications.info(result.message);

        // Close modal
        this.close();

        // Update contact manager if open
        window.CyberpunkAgent?.instance?.notifyContactUpdate({
          action: 'add',
          deviceId: deviceId,
          contactDeviceId: this.searchResult.deviceId
        });
      } else {
        this._showError(result?.message || 'Erro ao adicionar contato');
      }

    } catch (error) {
      console.error('ContactSearchModal | Error adding contact:', error);
      this._showError('Erro ao adicionar contato');
    }
  }

  /**
   * Handle close button click
   */
  _onCloseClick() {
    this.close();
  }

  /**
   * Update search button state
   */
  _updateSearchButton() {
    const searchBtn = this.element?.find('[data-action="search"]');
    if (searchBtn) {
      const hasPhoneNumber = this.phoneNumber.trim().length > 0;
      searchBtn.prop('disabled', !hasPhoneNumber);
    }
  }

  /**
   * Clear search results
   */
  _clearResults() {
    this.searchResult = null;
    this._hideResult();
    this._hideError();
  }

  /**
   * Show search result
   */
  _showResult() {
    const resultElement = this.element?.find('.cpa-search-result');
    const errorElement = this.element?.find('.cpa-error-message');

    if (resultElement && this.searchResult) {
      // Update result content
      resultElement.find('.cpa-result-name').text(this.searchResult.name);
      resultElement.find('.cpa-result-number').text(this.searchResult.displayPhoneNumber);

      // Show result
      resultElement.show();
      errorElement?.hide();
    }
  }

  /**
   * Hide search result
   */
  _hideResult() {
    const resultElement = this.element?.find('.cpa-search-result');
    resultElement?.hide();
  }

  /**
   * Show error message
   */
  _showError(message) {
    const errorElement = this.element?.find('.cpa-error-message');
    const resultElement = this.element?.find('.cpa-search-result');

    if (errorElement) {
      errorElement.find('.cpa-error-text').text(message);
      errorElement.show();
      resultElement?.hide();
    }
  }

  /**
   * Hide error message
   */
  _hideError() {
    const errorElement = this.element?.find('.cpa-error-message');
    errorElement?.hide();
  }

  /**
   * Update UI based on current state
   */
  _updateUI() {
    const searchBtn = this.element?.find('[data-action="search"]');
    if (searchBtn) {
      if (this.isSearching) {
        searchBtn.prop('disabled', true).text('BUSCANDO...');
      } else {
        this._updateSearchButton();
        searchBtn.text('BUSCAR');
      }
    }
  }
}

// Make it globally available
window.ContactSearchModal = ContactSearchModal; 