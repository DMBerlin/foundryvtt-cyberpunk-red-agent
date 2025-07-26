# Sistema de Atualização em Tempo Real - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora possui um sistema de atualização em tempo real que permite que as mudanças feitas pelo gamemaster na lista de contatos sejam refletidas automaticamente para todos os jogadores, sem necessidade de recarregar a página (F5).

## Como Funciona

### 1. Sistema de Notificação via Socket

Quando o gamemaster adiciona ou remove contatos através do Contact Manager, o sistema:

1. **Salva as alterações** nas configurações do FoundryVTT
2. **Envia uma notificação** via socket para todos os clientes conectados
3. **Atualiza automaticamente** todas as interfaces abertas dos jogadores

### 2. Detecção de Mudanças

O sistema utiliza dois métodos para detectar mudanças:

- **Socket Communication**: Notificações diretas entre clientes
- **Settings Hooks**: Detecção automática de mudanças nas configurações

### 3. Atualização de Interfaces

Quando uma mudança é detectada, o sistema:

1. **Recarrega os dados** de contatos das configurações
2. **Identifica interfaces abertas** (AgentHome, Chat7, ContactManager)
3. **Re-renderiza** automaticamente todas as interfaces afetadas
4. **Mostra notificação** para o usuário

## Funcionalidades Implementadas

### Para o Gamemaster

- ✅ Adicionar contatos através do Contact Manager
- ✅ Remover contatos através do Contact Manager
- ✅ Ver atualizações em tempo real em suas próprias interfaces
- ✅ Notificações automáticas enviadas para todos os jogadores
- ✅ Feedback visual quando interfaces são atualizadas

### Para os Jogadores

- ✅ Receber notificações quando contatos são atualizados
- ✅ Ver mudanças em tempo real nas interfaces abertas
- ✅ Não precisar recarregar a página (F5)
- ✅ Manter o estado das interfaces abertas
- ✅ Notificações informativas sobre quem fez as mudanças

## Arquivos Modificados

### `scripts/module.js`

- ✅ Adicionado método `notifyContactUpdate()` para enviar notificações
- ✅ Adicionado método `handleContactUpdate()` para processar notificações
- ✅ Adicionado método `updateOpenInterfaces()` para atualizar interfaces
- ✅ Adicionado método `setupSocketCommunication()` para configurar comunicação
- ✅ Adicionado método `hasOpenInterfaces()` para verificar interfaces abertas
- ✅ Adicionado método `getOpenInterfacesCount()` para contar interfaces
- ✅ Modificado método `saveContactNetworks()` para incluir notificações
- ✅ Adicionado hook para mudanças de configurações como backup

### `scripts/contact-manager.js`

- ✅ Removido `render(true)` manual após adicionar/remover contatos
- ✅ As atualizações agora são feitas automaticamente pelo sistema

### `__tests__/test-realtime.js` (Atualizado)

- ✅ Script de teste completo para verificar o funcionamento do sistema
- ✅ Funções para monitorar atualizações em tempo real
- ✅ Testes automatizados para validar a funcionalidade
- ✅ Verificação de status rápido do sistema

## Como Testar

### 1. Teste Básico

```javascript
// No console do navegador
testRealtimeUpdates()
```

### 2. Teste de Adição de Contato

```javascript
// No console do navegador (apenas GM)
testAddContactRealtime()
```

### 3. Teste de Fluxo Completo

```javascript
// No console do navegador
testCompleteRealtimeFlow()
```

### 4. Verificação de Status

```javascript
// No console do navegador
quickStatusCheck()
```

### 5. Monitoramento Contínuo

```javascript
// Iniciar monitoramento
monitorRealtimeUpdates()

// Parar monitoramento
stopRealtimeMonitor()
```

### 6. Funções Globais Disponíveis

```javascript
// Testar atualização em tempo real
testRealtimeUpdate()

// Testar comunicação entre clientes
testCrossClientCommunication()

// Testar broadcasting via chat
testChatBroadcasting()

// Verificar interfaces abertas
checkOpenInterfaces()

// Forçar atualização de interfaces
forceUpdateInterfaces()

// Verificação segura de status
safeStatusCheck()

// Verificar carregamento do módulo
checkModuleLoading()

// Monitorar notificações
monitorNotifications()
stopNotificationMonitor()

// Verificar conectividade de rede
checkNetworkConnectivity()

// Teste completo entre clientes
comprehensiveCrossClientTest()
```

## Fluxo de Funcionamento

```
GM adiciona/remove contato
        ↓
ContactManager salva dados
        ↓
saveContactNetworks() é chamado
        ↓
notifyContactUpdate() é chamado
        ↓
Socket notification enviada
        ↓
Todos os clientes recebem notificação
        ↓
handleContactUpdate() processa
        ↓
Dados são recarregados
        ↓
updateOpenInterfaces() atualiza interfaces
        ↓
Jogadores veem mudanças em tempo real
```

## Configurações

O sistema utiliza as seguintes configurações do FoundryVTT:

- `cyberpunk-agent.contact-networks`: Dados das redes de contatos
- `cyberpunk-agent.agent-data`: Dados internos do agente

## Troubleshooting

### Problemas Comuns

1. **Interfaces não atualizam**
   - Verifique se as interfaces estão realmente abertas
   - Use `checkOpenInterfaces()` para diagnosticar
   - Execute `forceUpdateInterfaces()` para forçar atualização

2. **Notificações não aparecem**
   - Verifique se o socket está funcionando
   - Confirme se o GM está fazendo as alterações
   - Use `quickStatusCheck()` para verificar o status

3. **Erros no console**
   - Verifique se todos os scripts estão carregados
   - Use `monitorRealtimeUpdates()` para monitorar
   - Execute `testRealtimeUpdates()` para diagnóstico completo

4. **"Instance not available" errors**
   - Use `checkModuleLoading()` para verificar o status de carregamento
   - Use `safeStatusCheck()` para verificação segura
   - Aguarde alguns segundos e tente novamente
   - Recarregue a página se o problema persistir

5. **Comunicação entre clientes não funciona**
   - Use `checkNetworkConnectivity()` para verificar conectividade
   - Use `testCrossClientCommunication()` para testar comunicação
   - Use `testChatBroadcasting()` para testar fallback via chat
   - Use `monitorNotifications()` para monitorar notificações
   - Verifique se ambos os clientes estão na mesma sessão
   - Confirme se o socket está funcionando em ambos os lados

6. **Erros de "querySelector is not a function"**
   - Este erro foi corrigido na versão atual
   - O sistema agora trata corretamente o conteúdo das mensagens
   - Use `testChatBroadcasting()` para verificar se está funcionando

### Logs de Debug

O sistema gera logs detalhados no console:

```
Cyberpunk Agent | Sending contact update notification to all clients
Cyberpunk Agent | Received contact update notification from: GM Name
Cyberpunk Agent | Updating open interfaces...
Cyberpunk Agent | Found X AgentHomeApplication instances
Cyberpunk Agent | Updated AgentHomeApplication
Cyberpunk Agent | Updated X interfaces
```

### Verificação de Status

Use `quickStatusCheck()` para verificar rapidamente:

- ✅ Socket disponível
- ✅ Métodos de atualização disponíveis
- ✅ Interfaces abertas
- ✅ Permissões de usuário

## Compatibilidade

- ✅ FoundryVTT v11
- ✅ Cyberpunk RED Core System
- ✅ Múltiplos jogadores simultâneos
- ✅ Interfaces múltiplas abertas
- ✅ Modo online e offline (com limitações)

## Limitações

- As notificações socket só funcionam quando o FoundryVTT está online
- Interfaces fechadas não são atualizadas automaticamente
- Mudanças offline não são sincronizadas até a próxima conexão
- Algumas interfaces podem não atualizar se estiverem em estado de erro

## Próximas Melhorias

- [ ] Notificações mais detalhadas (quem adicionou/removeu)
- [ ] Histórico de mudanças
- [ ] Sincronização offline melhorada
- [ ] Interface de configuração para o sistema
- [ ] Notificações sonoras opcionais
- [ ] Log de atividades para auditagem 