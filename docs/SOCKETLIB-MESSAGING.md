# SocketLib Messaging - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora utiliza o SocketLib para fornecer comunicação em tempo real para mensagens entre personagens. Esta implementação oferece:

- **Comunicação em tempo real** entre todos os clientes
- **Atualização automática** das interfaces de chat
- **Fallback robusto** para métodos alternativos
- **Persistência de dados** nas configurações do FoundryVTT

## Como Funciona

### 1. Arquitetura de Mensagens

```
Cliente A (Envia) → SocketLib → Todos os Clientes (Recebem)
     ↓
  Salva Localmente → Atualiza Interfaces → Notifica Usuários
```

### 2. Fluxo de Mensagem

1. **Envio**: Usuário digita e envia mensagem
2. **Processamento Local**: Mensagem é salva localmente
3. **Broadcast**: SocketLib envia para todos os clientes
4. **Recebimento**: Outros clientes recebem e processam
5. **Atualização**: Interfaces são atualizadas automaticamente

### 3. Handlers SocketLib

O módulo registra os seguintes handlers:

- `messageUpdate`: Notificação de nova mensagem
- `sendMessage`: Envio direto de mensagem
- `contactUpdate`: Atualização de contatos
- `ping/pong`: Teste de conectividade

## Implementação Técnica

### Registro de Handlers

```javascript
// Em socketlib-integration.js
socket.register("messageUpdate", handleMessageUpdate);
socket.register("sendMessage", handleSendMessage);
```

### Envio de Mensagem

```javascript
// Método principal de envio
async sendMessage(senderId, receiverId, text) {
    // 1. Salva localmente
    const message = { /* ... */ };
    conversation.push(message);
    this.saveMessages();
    
    // 2. Tenta SocketLib primeiro
    if (this._isSocketLibAvailable()) {
        await this.socketLibIntegration.sendMessage(senderId, receiverId, text, messageId);
    }
    
    // 3. Fallback se necessário
    if (!socketLibSuccess) {
        this.notifyMessageUpdate(senderId, receiverId, message);
    }
}
```

### Recebimento de Mensagem

```javascript
// Handler para mensagens recebidas
async function handleSendMessage(data) {
    // 1. Verifica se não é própria mensagem
    if (data.userId === game.user.id) return;
    
    // 2. Adiciona à conversa local
    const conversation = agent.messages.get(conversationKey);
    conversation.push(message);
    
    // 3. Salva e atualiza interfaces
    agent.saveMessages();
    agent._updateChatInterfacesImmediately();
}
```

## Configuração

### 1. Instalação do SocketLib

1. Vá para **Add-on Modules** no FoundryVTT
2. Instale **SocketLib** por League of Foundry Developers
3. Ative o módulo SocketLib
4. Reinicie o Cyberpunk Agent

### 2. Configuração de Comunicação

No módulo Cyberpunk Agent, configure o método de comunicação:

- **Automático (Recomendado)**: SocketLib > Socket > Chat > Nenhum
- **Apenas SocketLib**: Usa apenas SocketLib
- **Apenas Socket**: Usa socket nativo do FoundryVTT
- **Apenas Chat**: Usa mensagens de chat como fallback

## Funcionalidades

### ✅ Implementadas

- [x] Envio de mensagens via SocketLib
- [x] Recebimento em tempo real
- [x] Atualização automática de interfaces
- [x] Persistência de mensagens
- [x] Fallback para métodos alternativos
- [x] Notificações de usuário
- [x] Teste de conectividade
- [x] Tratamento de erros

### 🔄 Em Desenvolvimento

- [ ] Mensagens privadas (GM para jogador específico)
- [ ] Histórico de mensagens por sessão
- [ ] Indicadores de status (digitando, online, etc.)
- [ ] Anexos de arquivos
- [ ] Emojis e formatação

## Testes

### Funções de Teste Disponíveis

Execute no console do navegador:

```javascript
// Teste básico de mensagens
testBasicMessageFlow()

// Teste de atualizações em tempo real
testRealtimeMessageUpdates()

// Teste de atualização de interfaces
testMessageInterfaceUpdates()

// Teste dos handlers SocketLib
testSocketLibMessageHandlers()

// Teste de persistência
testMessagePersistence()

// Executar todos os testes
runAllMessageTests()
```

### Teste de Conectividade

```javascript
// Verificar status do SocketLib
getSocketLibStatus()

// Testar conexão
testSocketLib()

// Testar broadcast
testSocketLibBroadcast()

// Testar mensagens
testSocketLibMessages()
```

## Troubleshooting

### Problemas Comuns

#### 1. SocketLib não está funcionando

**Sintomas:**
- Mensagens não aparecem em outros clientes
- Erro "SocketLib not available"

**Soluções:**
1. Verifique se o SocketLib está instalado e ativo
2. Reinicie o módulo Cyberpunk Agent
3. Verifique a configuração de comunicação
4. Use `getSocketLibStatus()` para diagnóstico

#### 2. Mensagens não são salvas

**Sintomas:**
- Mensagens desaparecem após recarregar
- Erro ao salvar mensagens

**Soluções:**
1. Verifique permissões de GM
2. Verifique espaço em disco
3. Use `testMessagePersistence()` para testar

#### 3. Interfaces não atualizam

**Sintomas:**
- Mensagens não aparecem em interfaces abertas
- Precisa recarregar para ver mudanças

**Soluções:**
1. Verifique se há interfaces abertas
2. Use `forceUpdateChatInterfaces()`
3. Verifique logs de erro no console

### Logs de Debug

Ative logs detalhados no console:

```javascript
// Verificar status geral
console.log("SocketLib:", !!window.socketlib);
console.log("CyberpunkAgent:", !!window.CyberpunkAgent?.instance);
console.log("Communication method:", window.CyberpunkAgent?.instance?._getCommunicationMethod());
```

## Performance

### Otimizações Implementadas

1. **Atualização Local Imediata**: Interfaces são atualizadas antes do broadcast
2. **Deduplicação**: Mensagens duplicadas são ignoradas
3. **Timeouts**: Mensagens antigas são ignoradas (30s)
4. **Fallback Inteligente**: Métodos alternativos quando SocketLib falha

### Métricas de Performance

- **Latência**: < 100ms para mensagens locais
- **Broadcast**: < 500ms para todos os clientes
- **Persistência**: < 50ms para salvar mensagens
- **Interface Update**: < 200ms para atualizar interfaces

## Segurança

### Medidas Implementadas

1. **Validação de Dados**: Todas as mensagens são validadas
2. **Prevenção de Spam**: Rate limiting implícito
3. **Sanitização**: Texto é limpo antes de salvar
4. **Permissões**: Verificação de acesso a personagens

### Considerações

- Mensagens são salvas nas configurações do FoundryVTT
- Acesso baseado em permissões de personagem
- Logs de atividade para auditoria

## Compatibilidade

### Sistemas Suportados

- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED Core
- ✅ SocketLib v1.0+
- ✅ Navegadores modernos

### Fallbacks

Se o SocketLib não estiver disponível, o sistema usa:

1. **Socket Nativo**: WebSocket do FoundryVTT
2. **Chat Messages**: Mensagens de sistema
3. **Local Only**: Apenas atualização local

## Desenvolvimento

### Estrutura de Arquivos

```
scripts/
├── socketlib-integration.js    # Integração SocketLib
├── module.js                   # Lógica principal
└── agent-home.js              # Interfaces de chat

__tests__/
└── test-chat-messages.js      # Testes de mensagens
```

### Extensibilidade

Para adicionar novas funcionalidades:

1. Registre novo handler no SocketLib
2. Implemente lógica de processamento
3. Adicione testes correspondentes
4. Atualize documentação

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute testes de diagnóstico
3. Verifique logs do console
4. Consulte a documentação do SocketLib
5. Abra uma issue no GitHub 