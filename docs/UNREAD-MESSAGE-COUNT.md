# Sistema de Contador de Mensagens Não Lidas - Cyberpunk Agent

## Visão Geral

O sistema de contador de mensagens não lidas permite que os usuários vejam quantas mensagens novas receberam de cada contato desde a última vez que abriram o chat com esse contato. O contador é exibido como um chip colorido ao lado do nome do contato na lista de contatos do Chat7.

## Funcionalidades

### 📊 **Contador Visual**
- **Chip de contador**: Exibido no canto inferior direito do item do contato
- **Estilo cyberpunk**: Design quadrado com cor amarela do tema Cyberpunk 2077
- **Contagem em tempo real**: Atualiza automaticamente quando novas mensagens chegam

### 🔄 **Atualização Automática**
- **Tempo real**: Contador atualiza instantaneamente quando novas mensagens chegam
- **Cache inteligente**: Sistema de cache para performance otimizada
- **Sincronização**: Funciona em tempo real entre todos os clientes

### 📖 **Marcação de Leitura**
- **Abertura do chat**: Contador é zerado automaticamente quando o usuário abre o chat
- **Persistência**: Estado de leitura é salvo e mantido entre sessões
- **Timestamp preciso**: Registra exatamente quando a conversa foi lida pela última vez

## Como Funciona

### 1. **Rastreamento de Mensagens**
```javascript
// Quando uma nova mensagem chega
const unreadCount = agent.getUnreadCount(actorId, contactId);
// Retorna o número de mensagens não lidas
```

### 2. **Marcação de Leitura**
```javascript
// Quando o usuário abre o chat
agent.markConversationAsRead(actorId, contactId);
// Marca a conversa como lida e zera o contador
```

### 3. **Atualização em Tempo Real**
```javascript
// Sistema atualiza automaticamente as interfaces
agent._updateChat7Interfaces();
// Atualiza todos os contadores visíveis
```

## Estrutura de Dados

### **Timestamps de Leitura**
```javascript
// Armazenado em settings do FoundryVTT
lastReadTimestamps: {
  "actor1-actor2": 1640995200000, // Timestamp da última leitura
  "actor1-actor3": 1640995300000
}
```

### **Cache de Contadores**
```javascript
// Cache para performance
unreadCounts: {
  "actor1-actor2": 3, // 3 mensagens não lidas
  "actor1-actor3": 0  // 0 mensagens não lidas
}
```

## Interface Visual

### **Template do Chat7**
```html
<div class="cp-contact-info">
  <span class="cp-contact-name">{{this.name}}</span>
  {{#if this.unreadCount}}
  <span class="cp-unread-count">{{this.unreadCount}}</span>
  {{/if}}
</div>
```

### **Estilo CSS**
```css
.cp-unread-count {
  background: #FFD700;
  color: #000;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 2;
  border: 1px solid #FFA500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

## Métodos da API

### **getUnreadCount(actorId1, actorId2)**
Retorna o número de mensagens não lidas entre dois atores.

**Parâmetros:**
- `actorId1`: ID do primeiro ator (quem está verificando)
- `actorId2`: ID do segundo ator (contato)

**Retorna:**
- `number`: Número de mensagens não lidas

### **markConversationAsRead(actorId1, actorId2)**
Marca uma conversa como lida.

**Parâmetros:**
- `actorId1`: ID do primeiro ator
- `actorId2`: ID do segundo ator

### **getUnreadCountsForActor(actorId)**
Retorna contadores de mensagens não lidas para todos os contatos de um ator.

**Parâmetros:**
- `actorId`: ID do ator

**Retorna:**
- `object`: Mapa de contadores por contato

## Fluxo de Funcionamento

### 1. **Nova Mensagem Chega**
```
Mensagem enviada → Cache limpo → Interface atualizada → Contador exibido
```

### 2. **Usuário Abre Chat**
```
Chat aberto → Conversa marcada como lida → Contador zerado → Interface atualizada
```

### 3. **Atualização em Tempo Real**
```
Nova mensagem → Notificação enviada → Cache atualizado → Contador atualizado
```

## Configuração

### **Settings do FoundryVTT**
O sistema salva automaticamente os timestamps de leitura nas configurações do módulo:

```javascript
// Salvo automaticamente
game.settings.set('cyberpunk-agent', 'last-read-timestamps', timestampsData);
```

### **Carregamento Automático**
Os timestamps são carregados automaticamente quando o módulo inicializa:

```javascript
// Carregado automaticamente
this._loadReadTimestamps();
```

## Testes

### **Executar Testes**
```javascript
// No console do navegador
runUnreadCountTests();
```

### **Testes Disponíveis**
- `testUnreadCount()`: Teste básico de contador
- `testUnreadCountsForActor()`: Teste de múltiplos contatos
- `runUnreadCountTests()`: Executa todos os testes

## Compatibilidade

### **Sistemas Suportados**
- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED
- ✅ SocketLib (opcional)
- ✅ Comunicação nativa

### **Funcionalidades**
- ✅ Contadores em tempo real
- ✅ Persistência entre sessões
- ✅ Interface responsiva
- ✅ Animações CSS
- ✅ Cache de performance

## Troubleshooting

### **Contador Não Atualiza**
1. Verifique se o SocketLib está funcionando
2. Recarregue a página (F5)
3. Verifique o console para erros

### **Contador Não Zera**
1. Verifique se o chat foi aberto corretamente
2. Verifique se há erros no console
3. Teste com `markConversationAsRead()` manualmente

### **Performance**
1. O sistema usa cache para otimizar performance
2. Contadores são calculados sob demanda
3. Atualizações são limitadas para evitar spam

## Exemplos de Uso

### **Verificar Contador Manualmente**
```javascript
// No console do navegador
const agent = window.CyberpunkAgent.instance;
const unreadCount = agent.getUnreadCount('actor1', 'actor2');
console.log(`Mensagens não lidas: ${unreadCount}`);
```

### **Marcar Conversa Como Lida**
```javascript
// No console do navegador
const agent = window.CyberpunkAgent.instance;
agent.markConversationAsRead('actor1', 'actor2');
```

### **Obter Todos os Contadores**
```javascript
// No console do navegador
const agent = window.CyberpunkAgent.instance;
const unreadCounts = agent.getUnreadCountsForActor('actor1');
console.log('Contadores:', unreadCounts);
```

## Changelog

### **v1.0.0** - Implementação Inicial
- ✅ Sistema básico de contador
- ✅ Marcação de leitura
- ✅ Interface visual
- ✅ Persistência de dados
- ✅ Atualização em tempo real
- ✅ Testes automatizados 