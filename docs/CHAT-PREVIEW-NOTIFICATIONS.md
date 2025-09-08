# Chat Preview Notifications - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora inclui um sistema de notificações de preview no chat do FoundryVTT que cria cards de notificação similares aos de um smartphone quando novas mensagens chegam no Chat7.

## Como Funciona

### 1. Sistema de Notificações

Quando uma nova mensagem é recebida no Chat7, o sistema automaticamente:

1. **Verifica permissões**: Confirma se o usuário deve ver a notificação
2. **Verifica mudo**: Não mostra notificação se o contato estiver mutado
3. **Verifica conversa ativa**: Não mostra notificação se a conversa estiver aberta
4. **Cria preview**: Gera um card de notificação no chat do FoundryVTT
5. **Adiciona interatividade**: Botões para abrir Chat7 ou fechar notificação

### 2. Estrutura da Notificação

Cada notificação de preview contém:

```html
<div class="cyberpunk-agent-chat-preview">
  <div class="cp-preview-header">
    <div class="cp-preview-icon">
      <i class="fas fa-mobile-alt"></i>
    </div>
    <div class="cp-preview-title">
      <span class="cp-preview-app">CHAT7</span>
      <span class="cp-preview-subtitle">Nova Mensagem</span>
    </div>
    <div class="cp-preview-time">{{timestamp}}</div>
  </div>
  
  <div class="cp-preview-content">
    <div class="cp-preview-sender">
      <img src="{{senderImg}}" alt="{{senderName}}" />
      <span class="cp-preview-sender-name">{{senderName}}</span>
    </div>
    
    <div class="cp-preview-message">
      <div class="cp-preview-text">{{messagePreview}}</div>
    </div>
    
    <div class="cp-preview-actions">
      <button data-action="open-chat7">Abrir</button>
      <button data-action="dismiss">Fechar</button>
    </div>
  </div>
</div>
```

## Implementação Técnica

### 1. Métodos Principais

#### `showChatPreviewNotification(senderId, receiverId)`
Cria uma notificação de preview no chat do FoundryVTT.

**Parâmetros:**
- `senderId`: ID do dispositivo/ator remetente
- `receiverId`: ID do dispositivo/ator destinatário

#### `_createChatPreviewMessage(notificationData)`
Cria a mensagem no chat do FoundryVTT com o template renderizado.

#### `_setupChatPreviewEventListeners(chatMessage, notificationData)`
Configura os event listeners para os botões da notificação.

### 2. Controle de Visibilidade

As notificações seguem as mesmas regras de privacidade do sistema:

```javascript
// Determina quem deve ver a mensagem
const receiverUser = this._getUserForDevice(notificationData.receiverId);
const senderUser = this._getUserForDevice(notificationData.senderId);

let whisper = [];
let blind = false;

// Adiciona usuários que devem ver a mensagem
if (receiverUser && !receiverUser.isGM) whisper.push(receiverUser.id);
if (senderUser && !senderUser.isGM) whisper.push(senderUser.id);

// Se há whispers, torna blind para outros
if (whisper.length > 0) blind = true;
```

### 3. Integração com Hooks

O sistema usa hooks do FoundryVTT para renderizar as notificações:

```javascript
Hooks.on('renderChatMessage', (message, html, data) => {
    if (message.flags?.['cyberpunk-agent']?.isChatPreview) {
        message.element = html[0];
        this._setupChatPreviewEventListeners(message, {
            senderId: message.flags['cyberpunk-agent'].senderId,
            receiverId: message.flags['cyberpunk-agent'].receiverId
        });
    }
});
```

## Estilização CSS

### 1. Design Cyberpunk

As notificações seguem o tema cyberpunk do módulo:

```css
.cyberpunk-agent-chat-preview {
  background: var(--cp-gradient-card);
  border: 2px solid var(--cp-border-weak);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  box-shadow: var(--cp-shadow);
  animation: slideIn 0.3s ease-out;
}
```

### 2. Animações

- **slideIn**: Animação de entrada suave
- **glow**: Efeito de brilho na borda superior
- **hover**: Efeitos de hover nos botões

### 3. Responsividade

Design responsivo para diferentes tamanhos de tela:

```css
@media (max-width: 768px) {
  .cyberpunk-agent-chat-preview {
    padding: 12px;
    margin: 6px 0;
  }
  /* ... outros ajustes */
}
```

## Funcionalidades

### 1. Botão "Abrir"

- Abre o Chat7 do dispositivo destinatário
- Navega automaticamente para a conversa
- Funciona apenas para o usuário destinatário

### 2. Botão "Fechar"

- Remove a notificação do chat
- Não afeta a mensagem original no Chat7
- Disponível para todos os usuários que podem ver a notificação

### 3. Preview da Mensagem

- Mostra os primeiros 100 caracteres da mensagem
- Adiciona "..." se a mensagem for mais longa
- Preserva formatação básica

## Regras de Negócio

### 1. Quando Mostrar Notificação

- ✅ Nova mensagem recebida
- ✅ Contato não está mutado
- ✅ Conversa não está ativa
- ✅ Usuário tem permissão para ver a mensagem

### 2. Quando NÃO Mostrar Notificação

- ❌ Contato está mutado
- ❌ Conversa está ativa (usuário já está vendo)
- ❌ Usuário não tem permissão
- ❌ Mensagem é do próprio usuário

### 3. Privacidade

- **GM**: Vê notificações de todos os dispositivos
- **Player**: Vê apenas notificações de seus dispositivos
- **Mensagens privadas**: Apenas participantes veem a notificação

## Testes

### 1. Teste Manual

Execute no console do navegador:

```javascript
testChatPreviewNotifications()
```

### 2. Teste Automático

O sistema é testado automaticamente quando:

- Mensagens são enviadas entre dispositivos
- Contatos são adicionados/removidos
- Configurações de mudo são alteradas

## Compatibilidade

### 1. Sistemas Suportados

- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED Core
- ✅ SocketLib (para comunicação em tempo real)
- ✅ Todos os módulos de chat

### 2. Módulos Testados

- ✅ Chat Portrait
- ✅ Chat Enhancements
- ✅ Better Chat
- ✅ Chat Commands

## Desenvolvimento

### 1. Estrutura de Arquivos

```
templates/
└── chat-preview-notification.html    # Template da notificação

styles/
└── module.css                        # Estilos CSS

scripts/
└── module.js                         # Lógica principal
```

### 2. Extensibilidade

Para adicionar novas funcionalidades:

1. **Novos tipos de notificação**: Adicione flags específicas
2. **Novos botões**: Adicione data-action e event listeners
3. **Novos estilos**: Adicione CSS para novos elementos

### 3. Debug

Para debug, use os logs do console:

```javascript
console.log("Cyberpunk Agent | Chat preview notification created");
console.log("Cyberpunk Agent | Opened Chat7 from preview notification");
console.log("Cyberpunk Agent | Chat preview notification dismissed");
```

## Configuração

### 1. Ativação/Desativação

O sistema é ativado por padrão. Para desativar, comente a linha:

```javascript
this.showChatPreviewNotification(senderId, receiverId);
```

### 2. Personalização

Para personalizar:

- **Template**: Edite `templates/chat-preview-notification.html`
- **Estilos**: Edite `styles/module.css`
- **Comportamento**: Edite os métodos em `scripts/module.js`

## Troubleshooting

### 1. Problemas Comuns

**Notificação não aparece:**
- Verifique se o contato não está mutado
- Verifique se a conversa não está ativa
- Verifique permissões do usuário

**Botões não funcionam:**
- Recarregue a página
- Verifique se o CSS foi carregado
- Verifique logs do console

**Estilo incorreto:**
- Verifique se o CSS foi carregado
- Recarregue a página
- Verifique conflitos com outros módulos

### 2. Logs de Debug

```javascript
// Verificar notificações
console.log("Chat preview messages:", game.messages.contents.filter(m => m.flags?.['cyberpunk-agent']?.isChatPreview).length);

// Verificar event listeners
const messageElement = document.querySelector('[data-message-id="message-id"]');
console.log("Message element:", messageElement);
console.log("Buttons:", messageElement?.querySelectorAll('[data-action]'));
``` 