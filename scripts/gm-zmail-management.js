/**
 * GM ZMail Management Application
 * Allows GMs to send and manage ZMail messages to players
 */

console.log("Cyberpunk Agent | Loading gm-zmail-management.js...");

/**
 * GM ZMail Management Application
 */
class GMZMailManagementApplication extends FormApplication {
  constructor(options = {}) {
    super({}, options);
  }

  /**
   * Default options for the application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "gm-zmail-management",
      classes: ["cyberpunk-agent", "gm-zmail-management"],
      template: "modules/cyberpunk-agent/templates/gm-zmail-management.html",
      width: 800,
      height: 600,
      resizable: true,
      minimizable: true,
      title: "ZMail Management"
    });
  }

  /**
   * Get data for the template
   */
  async getData(options = {}) {
    const data = super.getData(options);

    // Get all registered devices (players only)
    const players = [];
    if (window.CyberpunkAgent?.instance) {
      for (const [deviceId, device] of window.CyberpunkAgent.instance.devices) {
        const user = window.CyberpunkAgent.instance._getUserForDevice(deviceId);
        if (user && !user.isGM) {
          players.push({
            deviceId: deviceId,
            deviceName: device.deviceName,
            actorName: device.ownerName || 'Unknown Actor'
          });
        }
      }
    }

    // Get ZMail statistics
    const stats = window.CyberpunkAgent?.instance?.getZMailStatistics() || {
      totalMessages: 0,
      unreadMessages: 0,
      activePlayers: 0
    };

    // Get recent ZMail messages
    const recentMessages = window.CyberpunkAgent?.instance?.getRecentZMailMessages(10) || [];

    return {
      ...data,
      players: players,
      totalMessages: stats.totalMessages,
      unreadMessages: stats.unreadMessages,
      activePlayers: stats.activePlayers,
      recentMessages: recentMessages
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Send ZMail button
    html.find('.send-zmail-btn').click(this._onSendZMailClick.bind(this));

    // ZMail management action buttons
    html.find('.zmail-action-btn[data-action="view-all-messages"]').click(this._onViewAllMessagesClick.bind(this));
    html.find('.zmail-action-btn[data-action="mark-all-read"]').click(this._onMarkAllReadClick.bind(this));
    html.find('.zmail-action-btn[data-action="clear-old-messages"]').click(this._onClearOldMessagesClick.bind(this));

    // Recent message actions
    html.find('.zmail-recent-action[data-action="view-message"]').click(this._onViewMessageClick.bind(this));
    html.find('.zmail-recent-action[data-action="delete-message"]').click(this._onDeleteMessageClick.bind(this));
  }

  /**
   * Handle send ZMail button click
   */
  async _onSendZMailClick(event) {
    event.preventDefault();

    const recipientDeviceId = this.element.find('#zmail-recipient').val();
    const sender = this.element.find('#zmail-sender').val().trim();
    const subject = this.element.find('#zmail-subject').val().trim();
    const content = this.element.find('#zmail-content').val().trim();

    // Validate inputs
    if (!recipientDeviceId) {
      ui.notifications.error("Selecione um destinatário!");
      return;
    }

    if (!sender) {
      ui.notifications.error("Digite o nome do remetente!");
      return;
    }

    if (!subject) {
      ui.notifications.error("Digite o assunto da mensagem!");
      return;
    }

    if (!content) {
      ui.notifications.error("Digite o conteúdo da mensagem!");
      return;
    }

    // Disable button during sending
    const sendBtn = this.element.find('.send-zmail-btn');
    const originalText = sendBtn.html();
    sendBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Enviando...');

    try {
      // Send ZMail message
      const success = await window.CyberpunkAgent?.instance?.sendZMailMessage(
        recipientDeviceId,
        sender,
        subject,
        content
      );

      if (success) {
        ui.notifications.info("ZMail enviado com sucesso!");

        // Clear form
        this.element.find('#zmail-sender').val('');
        this.element.find('#zmail-subject').val('');
        this.element.find('#zmail-content').val('');

        // Refresh the application
        this.render(true);
      } else {
        ui.notifications.error("Erro ao enviar ZMail!");
      }
    } catch (error) {
      console.error("Error sending ZMail:", error);
      ui.notifications.error("Erro ao enviar ZMail: " + error.message);
    } finally {
      // Re-enable button
      sendBtn.prop('disabled', false).html(originalText);
    }
  }

  /**
   * Handle view all messages click
   */
  _onViewAllMessagesClick(event) {
    event.preventDefault();
    console.log("View all messages clicked");

    // Show all ZMail messages in a dialog
    this._showAllMessagesDialog();
  }

  /**
   * Handle mark all as read click
   */
  async _onMarkAllReadClick(event) {
    event.preventDefault();
    console.log("Mark all as read clicked");

    const confirmed = await new Promise((resolve) => {
      new Dialog({
        title: "Marcar Todas como Lidas",
        content: `
          <div class="cp-mark-all-read-dialog">
            <p>Tem certeza que deseja marcar todas as mensagens ZMail como lidas?</p>
            <p><small>Esta ação afetará todos os jogadores.</small></p>
          </div>
        `,
        buttons: {
          cancel: {
            label: "Cancelar",
            callback: () => resolve(false)
          },
          confirm: {
            label: "Marcar como Lidas",
            callback: () => resolve(true)
          }
        }
      }).render(true);
    });

    if (confirmed) {
      // Mark all messages as read
      let markedCount = 0;
      if (window.CyberpunkAgent?.instance) {
        for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
          for (const message of messages) {
            if (!message.isRead) {
              message.isRead = true;
              markedCount++;
            }
          }
        }
        await window.CyberpunkAgent.instance.saveZMailData();
      }

      ui.notifications.info(`${markedCount} mensagens marcadas como lidas!`);
      this.render(true);
    }
  }

  /**
   * Handle clear old messages click
   */
  async _onClearOldMessagesClick(event) {
    event.preventDefault();
    console.log("Clear old messages clicked");

    const confirmed = await new Promise((resolve) => {
      new Dialog({
        title: "Limpar Mensagens Antigas",
        content: `
          <div class="cp-clear-old-messages-dialog">
            <p>Tem certeza que deseja limpar mensagens ZMail antigas (mais de 30 dias)?</p>
            <p><small>Esta ação não pode ser desfeita.</small></p>
          </div>
        `,
        buttons: {
          cancel: {
            label: "Cancelar",
            callback: () => resolve(false)
          },
          confirm: {
            label: "Limpar Mensagens",
            callback: () => resolve(true)
          }
        }
      }).render(true);
    });

    if (confirmed) {
      const success = await window.CyberpunkAgent?.instance?.clearOldZMailMessages(30);
      if (success) {
        ui.notifications.info("Mensagens antigas limpas com sucesso!");
        this.render(true);
      } else {
        ui.notifications.error("Erro ao limpar mensagens antigas!");
      }
    }
  }

  /**
   * Handle view message click
   */
  _onViewMessageClick(event) {
    event.preventDefault();
    const messageId = event.currentTarget.dataset.messageId;
    console.log("View message clicked:", messageId);

    // Find and show the message
    this._showMessageDialog(messageId);
  }

  /**
   * Handle delete message click
   */
  async _onDeleteMessageClick(event) {
    event.preventDefault();
    const messageId = event.currentTarget.dataset.messageId;
    console.log("Delete message clicked:", messageId);

    const confirmed = await new Promise((resolve) => {
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
            callback: () => resolve(false)
          },
          confirm: {
            label: "Deletar",
            callback: () => resolve(true)
          }
        }
      }).render(true);
    });

    if (confirmed) {
      // Find the message and delete it
      let deleted = false;
      if (window.CyberpunkAgent?.instance) {
        for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
          const messageIndex = messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
            deleted = true;
            break;
          }
        }
        if (deleted) {
          await window.CyberpunkAgent.instance.saveZMailData();
          ui.notifications.info("ZMail deletado com sucesso!");
          this.render(true);
        } else {
          ui.notifications.error("Mensagem não encontrada!");
        }
      }
    }
  }

  /**
   * Show all messages dialog
   */
  _showAllMessagesDialog() {
    const allMessages = [];

    if (window.CyberpunkAgent?.instance) {
      for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
        const device = window.CyberpunkAgent.instance.devices.get(deviceId);
        for (const message of messages) {
          allMessages.push({
            ...message,
            recipientDeviceId: deviceId,
            recipientName: device ? device.deviceName : `Device ${deviceId}`
          });
        }
      }
    }

    // Sort by timestamp (newest first)
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

    const content = `
      <div class="cp-all-messages-dialog">
        <h3>Total de Mensagens ZMail: ${allMessages.length}</h3>
        <div class="cp-messages-list" style="max-height: 400px; overflow-y: auto;">
          ${allMessages.map(msg => `
            <div class="cp-message-item" style="border: 1px solid var(--cp-border-weak); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${msg.sender}</strong>
                <span style="font-size: 0.9em; color: var(--cp-text-muted);">${msg.time}</span>
              </div>
              <div style="font-weight: 600; margin-bottom: 4px;">${msg.subject}</div>
              <div style="font-size: 0.9em; color: var(--cp-text-dim);">Para: ${msg.recipientName}</div>
              <div style="font-size: 0.9em; color: var(--cp-text-dim); margin-top: 4px;">
                ${msg.isRead ? '<span style="color: var(--cp-success);">✓ Lida</span>' : '<span style="color: var(--cp-primary);">● Não lida</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    new Dialog({
      title: "Todas as Mensagens ZMail",
      content: content,
      buttons: {
        close: {
          label: "Fechar"
        }
      }
    }).render(true);
  }

  /**
   * Show message dialog
   */
  _showMessageDialog(messageId) {
    let message = null;
    let recipientName = 'Unknown';

    if (window.CyberpunkAgent?.instance) {
      for (const [deviceId, messages] of window.CyberpunkAgent.instance.zmailMessages) {
        const foundMessage = messages.find(msg => msg.id === messageId);
        if (foundMessage) {
          message = foundMessage;
          const device = window.CyberpunkAgent.instance.devices.get(deviceId);
          recipientName = device ? device.deviceName : `Device ${deviceId}`;
          break;
        }
      }
    }

    if (!message) {
      ui.notifications.error("Mensagem não encontrada!");
      return;
    }

    const content = `
      <div class="cp-message-dialog">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong>De: ${message.sender}</strong>
            <span style="font-size: 0.9em; color: var(--cp-text-muted);">${message.time}</span>
          </div>
          <div style="font-weight: 600; margin-bottom: 4px;">Assunto: ${message.subject}</div>
          <div style="font-size: 0.9em; color: var(--cp-text-dim);">Para: ${recipientName}</div>
        </div>
        <div style="background: var(--cp-gradient-message); border: 1px solid var(--cp-border-weak); border-radius: 8px; padding: 16px; white-space: pre-wrap;">
          ${message.content}
        </div>
        <div style="margin-top: 12px; font-size: 0.9em; color: var(--cp-text-dim);">
          Status: ${message.isRead ? '<span style="color: var(--cp-success);">✓ Lida</span>' : '<span style="color: var(--cp-primary);">● Não lida</span>'}
        </div>
      </div>
    `;

    new Dialog({
      title: `ZMail: ${message.subject}`,
      content: content,
      buttons: {
        close: {
          label: "Fechar"
        }
      }
    }).render(true);
  }
}

// Export class for global access
window.GMZMailManagementApplication = GMZMailManagementApplication;

console.log("Cyberpunk Agent | gm-zmail-management.js loaded successfully");
console.log("Cyberpunk Agent | GMZMailManagementApplication defined:", typeof GMZMailManagementApplication);
