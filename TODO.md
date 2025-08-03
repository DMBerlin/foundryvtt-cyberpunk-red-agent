# TODO - Refatoração do Cyberpunk Agent

## Problemas Identificados

### 🔴 Críticos
- [x] **Mensagens do player não chegam para o GM** - Sistema de salvamento com problemas ✅ RESOLVIDO
- [x] **Notificações inadequadas** - Não seguem as regras especificadas ✅ RESOLVIDO
- [x] **Sistema de leitura/não leitura** - Não implementado corretamente ✅ RESOLVIDO

### 🟡 Importantes
- [x] **Verificação de permissões de Actor** - GM pode usar qualquer Actor, Player só o seu ✅ IMPLEMENTADO
- [x] **Mensagens privadas no chat** - Precisa ser implementado corretamente ✅ IMPLEMENTADO
- [x] **Contadores de mensagens não lidas** - Precisa atualizar em tempo real ✅ IMPLEMENTADO E MELHORADO

## Regras de Negócio - Análise

### ✅ Implementado Corretamente
- [x] GM pode definir qual Actor usar
- [x] Player só pode usar Actor que é dono
- [x] Comunicação em tempo real via SocketLib
- [x] Interface do Chat7
- [x] Sistema de contatos

### ❌ Precisa Refatoração
- [x] **Notificações**: Deve informar apenas "nova mensagem no Chat7" ✅ IMPLEMENTADO
- [x] **Mensagens privadas**: Deve ser privada entre GM e Jogador ✅ IMPLEMENTADO
- [x] **Sistema de leitura**: Mensagens devem ter status read/unread ✅ IMPLEMENTADO
- [x] **Salvamento de mensagens**: Players devem conseguir salvar mensagens ✅ IMPLEMENTADO
- [x] **Contadores em tempo real**: Deve atualizar automaticamente ✅ IMPLEMENTADO E MELHORADO

## Plano de Refatoração

### 1. Sistema de Mensagens
- [ ] Corrigir salvamento de mensagens para players
- [ ] Implementar sistema de status read/unread
- [ ] Garantir que mensagens chegam para todos os participantes

### 2. Notificações
- [ ] Notificação de sistema: "Nova mensagem no Chat7"
- [ ] Mensagem privada no chat: Preview da mensagem
- [ ] Som de notificação apenas para destinatário

### 3. Permissões e Controles
- [ ] Verificar permissões de Actor por tipo de usuário
- [ ] Implementar controle de acesso adequado
- [ ] Garantir que GM pode usar qualquer Actor

### 4. Interface e UX
- [x] Contadores de mensagens não lidas em tempo real ✅ IMPLEMENTADO E MELHORADO
- [x] Marcação automática de mensagens como lidas ✅ IMPLEMENTADO E MELHORADO
- [x] Atualização automática de interfaces ✅ IMPLEMENTADO E MELHORADO

## Arquivos a Modificar

### scripts/module.js
- [ ] `sendMessage()` - Corrigir salvamento
- [ ] `_createFoundryChatMessage()` - Implementar mensagens privadas
- [ ] `markConversationAsRead()` - Implementar sistema de leitura
- [ ] `getUnreadCount()` - Corrigir contadores

### scripts/socketlib-integration.js
- [ ] `handleSendMessage()` - Garantir processamento correto
- [ ] `handleSaveMessages()` - Corrigir salvamento para players

### scripts/agent-home.js
- [x] `Chat7Application` - Atualizar contadores em tempo real ✅ IMPLEMENTADO E MELHORADO
- [x] `ChatConversationApplication` - Marcar mensagens como lidas ✅ IMPLEMENTADO E MELHORADO

## Testes Necessários

### Testes de Funcionalidade
- [x] GM → Player: Mensagem chega corretamente ✅ TESTADO
- [x] Player → GM: Mensagem chega corretamente ✅ TESTADO
- [x] Player → Player: Mensagem chega corretamente ✅ TESTADO
- [x] Notificações aparecem corretamente ✅ TESTADO
- [x] Contadores atualizam em tempo real ✅ TESTADO E MELHORADO

### Testes de Permissões
- [ ] GM pode usar qualquer Actor
- [ ] Player só pode usar Actor próprio
- [ ] Mensagens privadas funcionam
- [ ] Salvamento funciona para todos os tipos de usuário

## Prioridades

1. **ALTA**: Corrigir mensagens do player para GM ✅ RESOLVIDO
2. **ALTA**: Implementar sistema de leitura/não leitura ✅ RESOLVIDO
3. **MÉDIA**: Corrigir notificações ✅ RESOLVIDO
4. **MÉDIA**: Implementar mensagens privadas ✅ RESOLVIDO
5. **BAIXA**: Melhorias de UX ✅ RESOLVIDO

## Status Atual - v1.0.17

### ✅ Funcionalidades Implementadas e Testadas
- **Sistema de Mensagens**: Fluxo bidirecional GM ↔ Player funcionando
- **Notificações**: Simplificadas para "Nova mensagem no Chat7"
- **Mensagens Privadas**: Implementadas corretamente
- **Sistema de Leitura**: Status read/unread implementado
- **Contadores em Tempo Real**: Atualização automática de contadores
- **Marcação Automática**: Mensagens marcadas como lidas ao abrir chat
- **UI Notifications**: Removidas da interface, movidas para console logs
- **Unread Chips**: Corrigidos para zerar quando chat é aberto
- **Real-time Updates**: Corrigidos para atualizar quando novas mensagens chegam
- **Interface Re-rendering**: Chat7 re-renderiza corretamente quando contadores mudam
- **Fadeout de Avisos**: Corrigido comportamento do fadeout de avisos de contato adicionado

### 🔧 Correções Recentes (v1.0.16)
- **Contadores em Tempo Real**: Melhorada atualização imediata de contadores de mensagens não lidas
- **Marcação Automática**: Melhorada marcação automática de mensagens como lidas ao abrir conversa
- **Cache de Contadores**: Implementada limpeza forçada do cache para garantir recálculo correto
- **Suporte Legacy**: Adicionado suporte para janelas Chat7Application legacy
- **Múltiplas Estratégias**: Implementadas múltiplas estratégias de atualização da UI
- **Logs de Debug**: Adicionados logs detalhados para melhor debugging

### 🔧 Correções Recentes (v1.0.17)
- **Fadeout de Avisos**: Corrigido problema onde o aviso de contato adicionado não fazia fadeout corretamente
- **Navegação Após Adição**: Ajustada lógica para navegar de volta à lista de contatos apenas após o fadeout completo
- **Timing de Animações**: Reduzido tempo de exibição do aviso de sucesso de 5 para 3 segundos para melhor UX

### 🔧 Correções Recentes (v1.0.16)
- **Contadores em Tempo Real**: Melhorada atualização imediata de contadores de mensagens não lidas
- **Marcação Automática**: Melhorada marcação automática de mensagens como lidas ao abrir conversa
- **Cache de Contadores**: Implementada limpeza forçada do cache para garantir recálculo correto
- **Suporte Legacy**: Adicionado suporte para janelas Chat7Application legacy
- **Múltiplas Estratégias**: Implementadas múltiplas estratégias de atualização da UI
- **Logs de Debug**: Adicionados logs detalhados para melhor debugging

### 🔧 Correções Recentes (v1.0.15)
- **Notificações de Salvamento**: Removida notificação "Mensagens salvas com sucesso" da UI, movida para console log
- **Interface Mais Limpa**: Reduzidas notificações desnecessárias na interface do usuário

### 🔧 Correções Recentes (v1.0.14)
- **Notificações UI**: Removidas notificações de interface atualizada da UI
- **Chips de Mensagens**: Corrigido problema dos chips não zerarem ao abrir chat
- **Atualizações em Tempo Real**: Corrigido chips não atualizarem quando Agent está aberto na lista de contatos
- **Re-renderização**: Interface Chat7 agora re-renderiza completamente quando contadores mudam
- **Debug Logging**: Adicionados logs detalhados para melhor debugging
- **Menu de Contexto**: Opção "Marcar Todos como Lidos" adicionada
- **Permissões**: GM pode usar qualquer Actor, Player só o seu
- **Salvamento**: Funciona para todos os tipos de usuário
- **Interface**: Scroll manual, contadores visuais, indicadores de mute

### 🧪 Testes Disponíveis
- `testRealtimeUnreadCountFix()` - Teste completo das melhorias de contadores em tempo real
- `testMarkAsRead()` - Teste completo da funcionalidade de marcação
- `testManualMarkAsRead()` - Teste manual de marcação
- `testBusinessRules()` - Teste das regras de negócio
- `testMessageLoopFix()` - Teste do fix do loop de mensagens
- `testContactMute()` - Teste do sistema de mute
- `testScrollBehaviorFix()` - Teste do comportamento de scroll
- `testAutoFadeAlerts()` - Teste do sistema de fadeout de avisos
- `testCorrectedFadeoutBehavior()` - Teste específico do comportamento corrigido de fadeout e navegação

### 🎯 Próximos Passos Sugeridos
- Melhorias de performance para grandes volumes de mensagens
- Sistema de backup automático de conversas
- Integração com outros módulos de chat
- Temas visuais adicionais
- Sistema de grupos de contatos 
- Precisa corrigir a implementação do real-time na lista de contatos, quando um contato recebe uma mensagem de um contato que não está na sua lista. Quando um usuário está com a lista de contatos aberta e uma nova mensagem chega de um contato que o usuário não possui na sua lista, este novo contato deve ser aparecer na lista de contatos imediatamente, sem a necessidade do usuário fechar o Agente e abri-lo novamente.
- Ao enviar mensagens para o agent de um user desconectado da sessão, fazer com ele receba todo o batch de mensagens que foi enviado para ele, durante seu período offline
- Transformar o Agent em uma plataforma inicial e que todos os apps sejam módulos que possam ser instalados individualmente; exemplo: O "Chat7" seria um módulo a parte que para poder ser instalado, precisa do Cyberpunk Agent como dependência, da mesma forma que o Cyberpunk Agent precisa do Socketlib para funcionar

### 🔧 Correções Recentes (v1.0.18)
- **Real-time Contact List Update**: Corrigido problema onde novos contatos adicionados automaticamente não apareciam na lista de contatos em tempo real
- **Contact Update Events**: Implementado sistema de eventos para atualização imediata da interface quando novos contatos são adicionados
- **Chat7 Interface Updates**: Melhorada atualização de interfaces Chat7 para incluir tanto Chat7Application legacy quanto AgentApplication unificado
- **Auto-contact Addition**: Aprimorado sistema de adição automática de contatos para atualizar a UI imediatamente
- **UI Component Updates**: Corrigida identificação de componentes para usar device.id em vez de actor.id no AgentApplication unificado
