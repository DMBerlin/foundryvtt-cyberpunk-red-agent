# Testes do Cyberpunk Agent

Esta pasta contém todos os scripts de teste para o módulo Cyberpunk Agent.

## 📋 Lista de Testes

### 🔧 Testes de Funcionalidade Geral
- **`test.js`** - Testes gerais do módulo
- **`test-realtime.js`** - Testes de atualizações em tempo real
- **`test-cross-client.js`** - Testes de comunicação entre clientes
- **`test-contact-manager.js`** - Testes do gerenciador de contatos
- **`test-compact-ui.js`** - Testes da interface compacta

### 🔍 Testes de Funcionalidades Específicas
- **`test-filter-preservation.js`** - Testes de preservação de filtros
- **`test-chat-messages.js`** - Testes de mensagens de chat
- **`test-communication-methods.js`** - Testes de métodos de comunicação
- **`test-chat7-rendering.js`** - Testes de renderização do Chat7
- **`test-conversation-view.js`** - Testes da visualização de conversas
- **`test-conversation-clear.js`** - Testes de limpeza de conversas
- **`test-flutter-ui-system.js`** - Testes do sistema de UI Flutter
- **`test-single-instance.js`** - Testes de instância única
- **`test-business-rules.js`** - Testes de regras de negócio

### 📱 Testes de Mensagens e Comunicação
- **`test-message-sync.js`** - Testes de sincronização de mensagens
- **`test-message-sending.js`** - Testes de envio de mensagens
- **`test-message-persistence-fix.js`** - Testes de persistência de mensagens
- **`test-message-loop-fix.js`** - Testes de correção de loop de mensagens
- **`test-realtime-message-fix.js`** - Testes de correção de mensagens em tempo real
- **`test-realtime-unread-count.js`** - Testes de contagem de não lidas em tempo real

### 🔌 Testes de SocketLib
- **`test-socketlib-simple.js`** - Teste simples da SocketLib
- **`test-socketlib-debug.js`** - Debug completo da SocketLib
- **`test-socketlib-propagation.js`** - Testes de propagação via SocketLib
- **`test-socketlib-comparison.js`** - Comparação entre métodos de comunicação
- **`test-socketlib-fix.js`** - Testes de correção da SocketLib
- **`test-socketlib-fix-comprehensive.js`** - Testes abrangentes de correção da SocketLib

### 🔐 Testes de Permissões e Segurança
- **`test-permissions-fix.js`** - Testes de correção de permissões
- **`test-actor-isolation.js`** - Testes de isolamento de atores

### 🎨 Testes de Interface e UX
- **`test-interface-auto-open-fix.js`** - Testes de correção de abertura automática
- **`test-scroll-behavior.js`** - Testes de comportamento de scroll
- **`test-scroll-behavior-fix.js`** - Testes de correção de scroll
- **`test-smart-scroll.js`** - Testes de scroll inteligente
- **`test-simple-scroll.js`** - Testes de scroll simples
- **`test-scroll-issue.js`** - Testes de problemas de scroll
- **`test-unread-chip-fix.js`** - Testes de correção de chip de não lidas

### 🔔 Testes de Notificações
- **`test-notification-sound.js`** - Testes de som de notificação
- **`test-notification-sound-comprehensive.js`** - Testes abrangentes de som de notificação
- **`test-notification-cleanup.js`** - Testes de limpeza de notificações

### 📊 Testes de Contagem e Status
- **`test-unread-count.js`** - Testes de contagem de não lidas
- **`test-unread-count-comprehensive.js`** - Testes abrangentes de contagem de não lidas
- **`test-mark-as-read.js`** - Testes de marcação como lida

## 🚀 Como Usar

### Teste Simples da SocketLib
```javascript
testSocketLibSimple()
```

### Debug Completo da SocketLib
```javascript
runSocketLibDebug()
```

### Teste de Propagação
```javascript
runSocketLibPropagationTests()
```

### Teste de Comunicação
```javascript
runAllCommunicationTests()
```

### Teste de Mensagens de Chat
```javascript
runAllChatMessageTests()
```

### Teste de Preservação de Filtros
```javascript
runAllFilterTests()
```

### Teste do Gerenciador de Contatos
```javascript
runAllContactManagerTests()
```

## 📊 Funções de Teste Disponíveis

### SocketLib
- `testSocketLibSimple()` - Teste básico
- `runSocketLibDebug()` - Debug completo
- `runSocketLibPropagationTests()` - Testes de propagação
- `runSocketLibComparison()` - Comparação de métodos
- `forceSocketLibUsage()` - Forçar uso da SocketLib
- `restartSocketLib()` - Reiniciar SocketLib
- `checkSocketLibStatus()` - Verificar status

### Comunicação
- `runAllCommunicationTests()` - Todos os testes de comunicação
- `changeCommunicationMethod(method)` - Mudar método de comunicação
- `getCommunicationInfo()` - Informações de comunicação

### Chat Messages
- `runAllChatMessageTests()` - Todos os testes de chat
- `checkCurrentChatMessages()` - Verificar mensagens atuais

### Filtros
- `runAllFilterTests()` - Todos os testes de filtros
- `checkCurrentFilterState()` - Verificar estado do filtro

### Gerenciador de Contatos
- `runAllContactManagerTests()` - Todos os testes do gerenciador

## 🔧 Utilitários

### Verificação de Status
- `checkOpenInterfaces()` - Verificar interfaces abertas
- `forceUpdateInterfaces()` - Forçar atualização de interfaces
- `getCurrentCommunicationInfo()` - Informações atuais de comunicação

### Debug
- `debugSocketLibPropagation()` - Debug de propagação
- `testContactUpdateFlow()` - Teste de fluxo de atualização
- `checkSocketLibMethods()` - Verificar métodos da SocketLib

## 📝 Notas

- Todos os testes são executados no console do navegador
- Alguns testes requerem múltiplos usuários conectados
- Alguns testes requerem permissões de GM
- Os testes incluem logs detalhados para diagnóstico

## 🐛 Solução de Problemas

Se um teste falhar:
1. Verifique se o módulo está carregado
2. Verifique se a SocketLib está instalada e ativa
3. Verifique se há múltiplos usuários conectados (se necessário)
4. Execute `runSocketLibDebug()` para diagnóstico completo 