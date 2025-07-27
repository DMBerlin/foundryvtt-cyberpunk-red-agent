# Mensagens Privadas - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora suporta mensagens privadas entre participantes, ocultando as conversas de outros jogadores no chat principal do FoundryVTT.

## Como Funciona

### 1. Sistema de Privacidade

- **Mensagens Privadas**: Visíveis apenas para sender, receiver e GMs
- **Mensagens Públicas**: Visíveis para todos os jogadores
- **Controle GM**: GM pode alternar entre modo privado e público

### 2. Configuração

No módulo Cyberpunk Agent, nas configurações:

- **Mensagens Privadas**: Ativar/desativar privacidade
- **Padrão**: Ativado (mensagens privadas)

### 3. Visibilidade

#### Modo Privado (Padrão)
- ✅ **Sender**: Vê suas mensagens
- ✅ **Receiver**: Vê mensagens recebidas
- ✅ **GM**: Vê todas as mensagens
- ❌ **Outros Jogadores**: Não veem mensagens

#### Modo Público
- ✅ **Todos**: Veem todas as mensagens
- ✅ **GM**: Vê todas as mensagens

## Implementação Técnica

### 1. Configuração de Privacidade

```javascript
// Verificar se mensagens privadas estão ativadas
const privateMessages = game.settings.get('cyberpunk-agent', 'private-messages');
```

### 2. Criação de Mensagens Privadas

```javascript
// Determinar visibilidade
if (privateMessages) {
    // Modo privado
    type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
    
    // Adicionar GMs, sender e receiver aos whispers
    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
    whisper.push(...gmUsers, senderUser.id, receiverUser.id);
    
    // Tornar blind para não participantes
    blind = true;
} else {
    // Modo público
    type = CONST.CHAT_MESSAGE_TYPES.IC;
    blind = false;
}
```

### 3. Estrutura da Mensagem

```javascript
{
    type: CONST.CHAT_MESSAGE_TYPES.WHISPER, // ou IC
    whisper: [userId1, userId2, ...], // IDs dos usuários que podem ver
    blind: true, // ou false
    flags: {
        'cyberpunk-agent': {
            isAgentMessage: true,
            isPrivate: true, // ou false
            // ... outros flags
        }
    }
}
```

## Estilização

### 1. Mensagens Públicas
- **Cor**: Verde cyberpunk (#00ff00)
- **Borda**: Verde
- **Indicador**: Nenhum

### 2. Mensagens Privadas
- **Cor**: Magenta (#ff00ff)
- **Borda**: Magenta
- **Indicador**: 🔒 (cadeado)

### 3. CSS

```css
/* Mensagens públicas (padrão) */
.cyberpunk-agent-chat-message {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
    border: 1px solid rgba(0, 255, 0, 0.3);
}

/* Mensagens privadas */
.cyberpunk-agent-chat-message[data-private="true"] {
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
    border: 1px solid rgba(255, 0, 255, 0.3);
}

.cyberpunk-agent-chat-message[data-private="true"] .cyberpunk-agent-chat-header::after {
    content: ' 🔒';
    color: #ff00ff;
}
```

## Funcionalidades

### ✅ Implementadas

- [x] Mensagens privadas entre participantes
- [x] Visibilidade para GMs
- [x] Configuração on/off
- [x] Estilização diferenciada
- [x] Indicador visual de privacidade
- [x] Fallback para mensagens públicas
- [x] Integração com SocketLib
- [x] Persistência de configuração

### 🔄 Em Desenvolvimento

- [ ] Grupos de conversa (múltiplos participantes)
- [ ] Níveis de privacidade (GM, jogador, público)
- [ ] Logs de auditoria
- [ ] Notificações de privacidade

## Testes

### Funções de Teste Disponíveis

Execute no console do navegador:

```javascript
// Testar sistema de mensagens privadas
testPrivateMessages()

// Alternar configuração de privacidade
togglePrivateMessages()

// Verificar configuração atual
game.settings.get('cyberpunk-agent', 'private-messages')
```

### Exemplo de Teste

```javascript
// Teste completo de privacidade
console.log("=== Teste de Mensagens Privadas ===");

// 1. Verificar configuração atual
const isPrivate = game.settings.get('cyberpunk-agent', 'private-messages');
console.log(`🔒 Mensagens privadas: ${isPrivate ? 'Ativadas' : 'Desativadas'}`);

// 2. Testar envio de mensagem
testPrivateMessages();

// 3. Alternar configuração
setTimeout(() => {
    togglePrivateMessages();
    testPrivateMessages();
}, 3000);
```

## Vantagens

### 1. **Privacidade**
- Conversas privadas entre jogadores
- GMs ainda podem monitorar
- Controle granular de visibilidade

### 2. **Flexibilidade**
- Alternar entre modo privado e público
- Configuração por mundo
- Fácil de usar

### 3. **Segurança**
- Mensagens não vazam para outros jogadores
- Sistema robusto de permissões
- Integração com sistema nativo do FoundryVTT

### 4. **UX**
- Indicadores visuais claros
- Estilização diferenciada
- Feedback imediato

## Configuração

### 1. Ativar/Desativar

**Via Configurações:**
1. Vá para **Configurações do Mundo**
2. Encontre **Cyberpunk Agent**
3. Marque/desmarque **Mensagens Privadas**

**Via Console:**
```javascript
togglePrivateMessages()
```

### 2. Verificar Status

```javascript
// Verificar se está ativado
const isPrivate = game.settings.get('cyberpunk-agent', 'private-messages');
console.log(`Privacidade: ${isPrivate ? 'Ativada' : 'Desativada'}`);
```

## Troubleshooting

### Problemas Comuns

#### 1. Mensagens ainda visíveis para todos

**Sintomas:**
- Mensagens aparecem para jogadores não participantes
- Configuração não está sendo aplicada

**Soluções:**
1. Verificar configuração: `game.settings.get('cyberpunk-agent', 'private-messages')`
2. Recarregar a página
3. Verificar permissões de GM
4. Usar `testPrivateMessages()` para testar

#### 2. GMs não veem mensagens

**Sintomas:**
- GMs não conseguem ver mensagens privadas
- Erro de permissão

**Soluções:**
1. Verificar se o usuário tem permissão de GM
2. Verificar configurações de whisper
3. Recarregar a página

#### 3. Indicador visual não aparece

**Sintomas:**
- Mensagens privadas sem cadeado
- Estilização não aplicada

**Soluções:**
1. Verificar se CSS foi carregado
2. Recarregar a página
3. Verificar conflitos com outros módulos

### Logs de Debug

```javascript
// Verificar configuração
console.log("Private messages:", game.settings.get('cyberpunk-agent', 'private-messages'));

// Verificar mensagens no chat
const chatMessages = game.messages.contents.filter(m => m.flags?.['cyberpunk-agent']?.isAgentMessage);
console.log("Agent messages:", chatMessages.length);

// Verificar mensagens privadas
const privateMessages = chatMessages.filter(m => m.flags['cyberpunk-agent'].isPrivate);
console.log("Private messages:", privateMessages.length);
```

## Compatibilidade

### Sistemas Suportados

- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED Core
- ✅ SocketLib
- ✅ Sistema de permissões nativo

### Módulos Testados

- ✅ Chat Portrait
- ✅ Chat Enhancements
- ✅ Better Chat
- ✅ Chat Commands

## Desenvolvimento

### Estrutura de Arquivos

```
scripts/
├── module.js                   # Lógica de privacidade
└── socketlib-integration.js    # Comunicação privada

styles/
└── module.css                 # Estilos para mensagens privadas
```

### Hooks Utilizados

```javascript
// Criação de mensagens
_createFoundryChatMessage() // Com lógica de privacidade

// Configuração
game.settings.get('cyberpunk-agent', 'private-messages')
```

### Extensibilidade

Para adicionar novos níveis de privacidade:

1. **Novos tipos**: Adicione ao sistema de configuração
2. **Novos estilos**: Adicione CSS para novos indicadores
3. **Novos handlers**: Registre lógica de visibilidade
4. **Novos flags**: Adicione metadados às mensagens

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute testes de diagnóstico
3. Verifique logs do console
4. Teste com configurações diferentes
5. Abra uma issue no GitHub 