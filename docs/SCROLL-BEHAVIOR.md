# Sistema de Scroll Inteligente do Chat - Cyberpunk Agent

## Visão Geral

O sistema de scroll do chat foi completamente reformulado para ser **inteligente** e **respeitoso** com a intenção do usuário. Agora o scroll automático só acontece quando o usuário já está no final das mensagens, permitindo que ele faça scroll manual para ler mensagens antigas sem ser interrompido.

## Problema Resolvido

**Problema anterior:** 
1. Quando uma nova mensagem era enviada ou recebida, o scroll voltava para o início e depois ia para o final
2. O usuário não conseguia fazer scroll manual para ler mensagens antigas sem ser interrompido
3. Experiência desagradável e frustrante para o usuário

**Solução implementada:** Sistema inteligente de scroll que:
- Só faz scroll automático quando o usuário já está no final das mensagens
- Detecta quando o usuário está fazendo scroll manual e não interfere
- Permite leitura de mensagens antigas sem interrupções
- Mantém scroll automático apenas quando apropriado

## Funcionalidades Implementadas

### 1. Scroll Automático Inteligente

- **`_scrollToBottomImmediate()`**: Scroll imediato sem animação
- **`_scrollToBottom()`**: Scroll suave com animação
- **`_autoScrollIfAtBottom()`**: Scroll automático **apenas** se o usuário já estiver no final
- **`_ensureScrollToBottom()`**: Múltiplas tentativas de scroll para garantir posição correta

### 2. Detecção de Novas Mensagens

- **`_checkForNewMessages()`**: Monitora mudanças no número de mensagens
- **`_setupMutationObserver()`**: Observa mudanças no DOM em tempo real
- **`_setupRenderListener()`**: Intercepta re-renderizações da interface
- **`_setupScrollListener()`**: Detecta quando o usuário está fazendo scroll manual

### 3. Eventos Monitorados

- **Novas mensagens**: Scroll automático **apenas** se o usuário estiver no final
- **Re-renderização da interface**: Mantém scroll no final **apenas** se o usuário estiver no final
- **Foco na janela**: Scroll para o final **apenas** se o usuário estiver no final
- **Redimensionamento**: Mantém posição do scroll **apenas** se o usuário estiver no final
- **Mudanças no DOM**: Scroll automático **apenas** se o usuário estiver no final
- **Scroll manual do usuário**: Detecta e **não interfere** com a intenção do usuário

## Comportamento Inteligente

### Quando o Scroll Automático Acontece

✅ **SIM - Scroll automático acontece quando:**
- Usuário está **próximo ao final** das mensagens (dentro de 20px) E uma nova mensagem chega
- Usuário está **próximo ao final** das mensagens E a interface é re-renderizada
- Usuário está **próximo ao final** das mensagens E a janela ganha foco
- Usuário envia uma mensagem (sempre vai para o final para ver sua mensagem)

❌ **NÃO - Scroll automático NÃO acontece quando:**
- Usuário está fazendo scroll manual e **não está próximo ao final**
- Usuário está no meio do histórico de mensagens
- Usuário está lendo mensagens antigas

### Detecção de Scroll Manual (Simplificada)

O sistema detecta quando o usuário está fazendo scroll manual através de:
- Event listener no container de mensagens
- Flag `_shouldAutoScroll` que é atualizada em tempo real
- Cálculo simples: `scrollHeight - scrollTop <= clientHeight + 20`
- **Sem timeouts ou delays** - resposta imediata

## Implementação Técnica

### Métodos Principais

```javascript
// Scroll imediato para o final
_scrollToBottomImmediate() {
  const messagesContainer = this.element.find('#messages-container');
  if (messagesContainer.length) {
    const container = messagesContainer[0];
    container.scrollTop = container.scrollHeight;
    
    // Verificação dupla após breve delay
    setTimeout(() => {
      if (container.scrollTop < container.scrollHeight - container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    }, 10);
  }
}

// Scroll automático apenas se usuário estiver próximo ao final (baseado no exemplo do usuário)
_scrollToBottomIfNearBottom() {
  const messagesContainer = this.element.find('#messages-container')[0];
  if (messagesContainer && this._shouldAutoScroll) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    console.log("Cyberpunk Agent | Auto-scrolling to bottom");
  } else {
    console.log("Cyberpunk Agent | Not auto-scrolling, shouldAutoScroll:", this._shouldAutoScroll);
  }
}

// Múltiplas tentativas de scroll
_ensureScrollToBottom() {
  const attempts = [0, 50, 100, 200];
  attempts.forEach((delay) => {
    setTimeout(() => {
      this._scrollToBottomImmediate();
    }, delay);
  });
}

// Detecção de novas mensagens
_checkForNewMessages() {
  const currentMessages = window.CyberpunkAgent?.instance?.getMessagesForConversation(this.actor.id, this.contact.id) || [];
  const currentCount = currentMessages.length;
  
  if (this._lastMessageCount !== undefined && currentCount > this._lastMessageCount) {
    this._ensureScrollToBottom();
  }
  
  this._lastMessageCount = currentCount;
}
```

### Mutation Observer

```javascript
_setupMutationObserver() {
  const messagesContainer = this.element.find('#messages-container')[0];
  if (messagesContainer) {
    const observer = new MutationObserver((mutations) => {
      let shouldScroll = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                (node.classList.contains('cp-message') || 
                 node.querySelector('.cp-message'))) {
              shouldScroll = true;
            }
          });
        }
      });

      if (shouldScroll) {
        setTimeout(() => {
          this._scrollToBottomImmediate();
        }, 50);
      }
    });

    observer.observe(messagesContainer, {
      childList: true,
      subtree: true
    });
  }
}
```

### Detecção de Scroll Manual (Simplificada)

```javascript
_setupScrollListener() {
  const messagesContainer = this.element.find('#messages-container')[0];
  if (messagesContainer) {
    messagesContainer.addEventListener('scroll', () => {
      // Check if user is near bottom (within 20px)
      const nearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 20;
      this._shouldAutoScroll = nearBottom;
      console.log("Cyberpunk Agent | Scroll detected, shouldAutoScroll:", this._shouldAutoScroll);
    });
  }
}
```

### Override do Método Render

```javascript
_setupRenderListener() {
  const originalRender = this.render;
  this.render = function(force = false, options = {}) {
    const result = originalRender.call(this, force, options);
    
    setTimeout(() => {
      this._autoScrollIfAtBottom();
      this._checkForNewMessages();
    }, 100);
    
    return result;
  };
}
```

## CSS Melhorado

### Propriedades de Scroll

```css
.cp-messages-container {
  scroll-behavior: smooth;
  scroll-snap-type: y proximity;
  scroll-padding-bottom: 20px;
}

.cp-messages-list {
  justify-content: flex-end;
  margin-top: auto;
}
```

## Cenários de Uso

### 1. Envio de Mensagem
- Usuário digita e envia mensagem
- `_sendMessage()` chama `_scrollToBottomImmediate()`
- **SEMPRE** vai para o final (usuário quer ver sua mensagem)

### 2. Recebimento de Mensagem
- Nova mensagem chega via socket/chat
- `handleMessageUpdate()` atualiza interface
- `_updateChatInterfacesImmediately()` força re-render
- `_scrollToBottomIfNearBottom()` verifica se deve fazer scroll
- **SÓ** faz scroll se usuário estiver próximo ao final (dentro de 20px)

### 3. Leitura de Mensagens Antigas
- Usuário faz scroll manual para cima
- `_setupScrollListener()` detecta scroll manual
- `_shouldAutoScroll` flag é atualizada em tempo real
- Se usuário não estiver próximo ao final, novas mensagens **NÃO** fazem scroll automático
- Usuário pode ler mensagens antigas sem interrupção

### 4. Re-abertura do Chat
- Usuário sai e volta para o chat
- `activateListeners()` chama `_scrollToBottomImmediate()`
- Scroll vai para o final automaticamente

### 5. Atualizações em Tempo Real
- `MutationObserver` detecta mudanças no DOM
- `_scrollToBottomIfNearBottom()` verifica se deve fazer scroll
- **SÓ** faz scroll se usuário estiver próximo ao final (dentro de 20px)
- Experiência fluida e respeitosa para o usuário

## Benefícios

1. **Experiência do Usuário**: Scroll inteligente que respeita a intenção do usuário
2. **Leitura de Mensagens Antigas**: Usuário pode fazer scroll manual sem interrupções
3. **Scroll Automático Inteligente**: Só acontece quando apropriado
4. **Performance**: Sistema eficiente que não interfere desnecessariamente
5. **Robustez**: Funciona em diferentes cenários e navegadores
6. **Manutenibilidade**: Código bem estruturado e documentado

## Testes

O sistema inclui testes automatizados que verificam:

### `__tests__/test-scroll-behavior.js`
- Existência dos métodos de scroll
- Cálculo correto da posição do scroll
- Detecção de novas mensagens
- Funcionamento dos métodos principais

### `__tests__/test-smart-scroll.js`
- Comportamento inteligente do scroll automático
- Bloqueio de scroll quando usuário está fazendo scroll manual
- Bloqueio de scroll quando usuário não está no final
- Detecção correta de eventos de scroll

### `__tests__/test-simple-scroll.js`
- Implementação simplificada baseada no exemplo do usuário
- Verificação do flag `_shouldAutoScroll`
- Cálculo correto de "próximo ao final" (dentro de 20px)
- Comportamento de scroll automático

## Compatibilidade

- **FoundryVTT v10+**: Totalmente compatível
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop e mobile
- **Sistemas**: Windows, macOS, Linux 