# Changelog

All notable changes to this project will be documented in this file.

## [1.0.19] - 2024-12-29

### 🐛 Fixed - Message Sending and Display Issues

#### 🔧 Changed
- **SEND BUTTON SELECTOR**: Corrigido seletor do botão de enviar de `.cp-send-button` para `.cp-send-message` para corresponder ao template
- **IMMEDIATE DISPLAY**: Adicionada atualização imediata da interface após envio de mensagem
- **MESSAGE RENDERING**: Melhorado método `_renderConversationView()` com logs detalhados e estrutura HTML correta
- **DEBUG LOGGING**: Adicionados logs detalhados para rastrear problemas de envio e exibição de mensagens

#### ✨ Added
- **DIAGNOSTIC SCRIPT**: Adicionado `test-message-sending.js` para verificar funcionalidade de envio de mensagens
- **MESSAGE VALIDATION**: Verificação completa de dados de mensagens com logs detalhados
- **REAL-TIME TESTING**: Testes para atualizações em tempo real e exibição de mensagens

#### 🐛 Fixed
- **SEND BUTTON NOT WORKING**: Corrigido problema onde o botão de enviar não funcionava (apenas Enter funcionava)
- **MESSAGES NOT APPEARING**: Corrigido problema onde mensagens não apareciam imediatamente após serem enviadas
- **TEMPLATE MISMATCH**: Resolvido conflito entre seletores do template e listeners JavaScript
- **MESSAGE STRUCTURE**: Corrigida estrutura HTML das mensagens para corresponder ao template

#### 📚 Documentation
- Scripts de teste para verificar envio de mensagens
- Logs detalhados para debugging de problemas de mensagens
- Testes para funcionalidade de botão de enviar e exibição imediata

---

## [1.0.18] - 2024-12-29

### 🐛 Fixed - Contacts Display in Chat7

#### 🔧 Changed
- **TEMPLATE-BASED RENDERING**: Corrigido sistema de renderização de contatos para usar templates Handlebars em vez de manipulação manual do DOM
- **DATA FLOW**: Melhorado fluxo de dados para passar contatos via `getData()` para o template
- **EVENT LISTENERS**: Atualizados listeners para funcionar com estrutura do template Chat7
- **DEBUG LOGGING**: Adicionados logs detalhados para diagnóstico de problemas de contatos

#### ✨ Added
- **DIAGNOSTIC SCRIPT**: Adicionado `test-contacts-display.js` para diagnosticar problemas de exibição de contatos
- **TEMPLATE DATA**: Implementado sistema de dados específicos por view no método `getData()`
- **CONTACT VALIDATION**: Verificação completa de dados de contatos com logs detalhados

#### 🐛 Fixed
- **CONTACTS NOT SHOWING**: Corrigido problema onde contatos não apareciam na lista do Chat7
- **TEMPLATE MISMATCH**: Resolvido conflito entre renderização via template e manipulação manual do DOM
- **DATA INTEGRATION**: Corrigida integração entre dados do módulo e template Handlebars

#### 📚 Documentation
- Scripts de teste para diagnosticar problemas de contatos
- Logs detalhados para debugging de renderização
- Documentação sobre fluxo de dados template-based

---

## [1.0.17] - 2024-12-29

### 🔧 Changed - Single Instance Navigation

#### 🔧 Changed
- **UNIFIED APPLICATION**: Refatorado aplicações do Agent para usar classe unificada `AgentApplication` com navegação baseada em views
- **SINGLE INSTANCE**: Todas as telas do Agent (Home, Chat7, Conversa) agora funcionam dentro da mesma instância
- **NAVIGATION SYSTEM**: Implementado método `navigateTo()` para troca de views sem criar novas janelas
- **TEMPLATE SWITCHING**: Troca dinâmica de templates baseada na view atual (home, chat7, conversation)
- **LEGACY COMPATIBILITY**: Mantida compatibilidade com classes existentes `AgentHomeApplication`, `Chat7Application`, e `ChatConversationApplication`

#### ✨ Added
- **VIEW MANAGEMENT**: Adicionado gerenciamento de estado de views com propriedades `currentView` e `currentContact`
- **REAL-TIME LISTENERS**: Integrados listeners de atualização em tempo real para cada tipo de view
- **TEST SCRIPT**: Adicionado `test-single-instance.js` para verificar comportamento de navegação de instância única

#### 🐛 Fixed
- **NEW POPUPS**: Corrigido problema onde abrir chat do Agent Home criava novos popups em vez de navegar dentro da mesma instância
- **APPLICATION ARCHITECTURE**: Eliminada criação de múltiplas janelas do Agent durante navegação entre telas
- **POPUP PREVENTION**: Prevenida criação de novas janelas durante navegação entre screens

#### 📚 Documentation
- Scripts de teste para verificar navegação de instância única
- Documentação sobre arquitetura unificada do Agent
- Testes para prevenção de popups

---

## [1.0.16] - 2024-12-29

### 🔧 Changed - Chat7 Contact List Rendering

#### 🔧 Changed
- **REAL-TIME LISTENER**: Chat7Application agora possui listener em tempo real similar ao ChatConversationApplication
- **EVENT DISPATCHING**: `handleMessageUpdate()` agora dispara eventos DOM para atualizações em tempo real
- **RENDER METHOD**: Adicionado override ao método render do Chat7Application para garantir dados frescos
- **LISTENER SETUP**: Integrado setup de listener em tempo real no método `activateListeners` do Chat7Application

#### ✨ Added
- **REAL-TIME LISTENER**: Adicionado método `_setupRealtimeListener()` ao Chat7Application para lidar com atualizações em tempo real
- **EVENT DISPATCHING**: Melhorado `handleMessageUpdate()` para disparar eventos DOM para atualizações de interface em tempo real
- **TEST SCRIPT**: Adicionado script de teste abrangente para funcionalidade de renderização do Chat7

#### 🐛 Fixed
- **RENDERING ON OPEN**: Lista de contatos agora renderiza com dados frescos toda vez que é aberta
- **REAL-TIME UPDATES**: Lista de contatos agora atualiza quando novas mensagens chegam, similar à tela de conversa
- **MARK AS READ UPDATES**: Lista de contatos atualiza quando opção "marcar todas como lidas" é usada
- **EVENT HANDLING**: Chat7Application agora escuta eventos `cyberpunk-agent-update` com tipos `messageUpdate` e `contactUpdate`

#### 📚 Documentation
- Scripts de teste para verificar renderização da lista de contatos
- Testes para atualizações em tempo real
- Documentação sobre sistema de eventos em tempo real

---

## [1.0.15] - 2024-12-28

### 🔧 Changed - Save Success Notifications

#### 🔧 Changed
- **NOTIFICAÇÕES DE SALVAMENTO**: Notificação "Mensagens salvas com sucesso" movida para console log
- **REDUÇÃO DE NOTIFICAÇÕES UI**: Menos notificações na interface, mais informações no console para debugging
- **CONSISTÊNCIA**: Todas as notificações de sucesso do sistema agora vão para console log

#### 🐛 Fixed
- **NOTIFICAÇÕES DESNECESSÁRIAS**: Removida notificação "Mensagens salvas com sucesso" da UI
- **EXPERIÊNCIA DO USUÁRIO**: Interface mais limpa, sem notificações de operações internas do sistema

#### ✨ Added
- Script de teste `test-notification-cleanup.js` para verificar limpeza das notificações

#### 📚 Documentation
- Notificações de salvamento agora aparecem apenas no console para debugging
- Mantidas notificações de erro na UI para alertar usuários sobre problemas

---

## [1.0.14] - 2024-12-28

### 🐛 Fixed - Unread Message Chip Issues & UI Notifications

#### 🔧 Changed
- **NOTIFICAÇÕES UI REMOVIDAS**: Notificações de interface atualizada movidas para console log
- **ATUALIZAÇÃO DE INTERFACE**: Chat7 agora re-renderiza completamente quando contadores mudam
- **ESTRATÉGIA DE ATUALIZAÇÃO**: `_updateChat7Interfaces()` agora força re-render em vez de manipulação manual do DOM
- **LOGGING MELHORADO**: Logs detalhados em `markConversationAsRead()` e `getUnreadCount()` para debugging

#### ✨ Added
- Script de teste `test-unread-chip-fix.js` para verificar correções dos chips de mensagens não lidas
- Logs de debug para rastrear marcação de mensagens como lidas
- Verificação de cache de contadores não lidos

#### 🐛 Fixed
- **CHIPS NÃO ZERAM**: Corrigido problema dos chips de mensagens não lidas não zerarem quando chat é aberto
- **ATUALIZAÇÃO EM TEMPO REAL**: Corrigido chips não atualizarem quando novas mensagens chegam com Agent aberto na lista de contatos
- **NOTIFICAÇÕES UI**: Removidas notificações de interface atualizada da UI, movidas para console
- **RE-RENDERIZAÇÃO**: Interface Chat7 agora re-renderiza corretamente quando contadores mudam

#### 📚 Documentation
- Scripts de teste para verificar correções dos chips
- Logs de debug para rastrear problemas de contadores
- Testes para atualizações em tempo real

---

## [1.0.13] - 2024-12-28

### ✨ Added - Mark Messages as Read Functionality

#### 🔧 Changed
- **MARCAÇÃO AUTOMÁTICA**: Mensagens são marcadas como lidas automaticamente quando o chat é aberto
- **ATUALIZAÇÃO EM TEMPO REAL**: Contadores de mensagens não lidas atualizam imediatamente
- **MENU DE CONTEXTO EXPANDIDO**: Adicionada opção "Marcar Todos como Lidos" no menu de contexto
- **INTERFACE RESPONSIVA**: Chat7 atualiza contadores em tempo real quando mensagens são marcadas como lidas

#### ✨ Added
- Script de teste `test-mark-as-read.js` para verificar funcionalidade completa
- Função `_markAllMessagesAsRead()` para marcar mensagens via menu de contexto
- Chamada automática de `markConversationAsRead()` quando ChatConversationApplication é aberto
- Atualização automática de interfaces quando mensagens são marcadas como lidas
- Opção "Marcar Todos como Lidos" no menu de contexto dos contatos

#### 🐛 Fixed
- **MARCAÇÃO AUTOMÁTICA**: Corrigido para marcar mensagens como lidas quando chat é aberto
- **CONTADORES EM TEMPO REAL**: Contadores agora atualizam imediatamente quando mensagens são marcadas
- **MENU DE CONTEXTO**: Adicionada funcionalidade completa para marcar mensagens como lidas
- **SINCRONIZAÇÃO**: Interfaces atualizam corretamente após marcar mensagens como lidas

#### 📚 Documentation
- Scripts de teste para verificar marcação automática
- Testes para menu de contexto e funcionalidade manual
- Documentação sobre atualizações em tempo real
- Testes para contadores de mensagens não lidas

---

## [1.0.12] - 2024-12-28

### 🐛 Fixed - Scroll Bar Visibility for Players

#### 🔧 Changed
- **CSS OVERFLOW CORRIGIDO**: Alterado `overflow: hidden` para `overflow-y: auto` e `overflow-x: hidden` nos containers principais
- **SCROLL VERTICAL HABILITADO**: Agora permite scroll vertical quando necessário em todos os containers do Agent
- **CONSISTÊNCIA GM/PLAYER**: Scroll bar agora aparece tanto para GM quanto para Players

#### ✨ Added
- Script de teste `test-scroll-issue.js` para diagnosticar problemas de scroll
- Funções de teste para verificar propriedades CSS de scroll
- Análise de altura de conteúdo vs container

#### 🐛 Fixed
- **BARRA DE SCROLL SUMIU**: Corrigido problema da barra de scroll que não aparecia para Players
- **OVERFLOW HIDDEN**: Removido `overflow: hidden` que impedia scroll em `.cp-agent`, `.cp-agent .sheet-body` e `.cp-agent-phone`
- **SCROLL LATERAL**: Mantido `overflow-x: hidden` para evitar scroll horizontal indesejado

#### 📚 Documentation
- Scripts de teste para diagnosticar problemas de scroll
- Análise detalhada de propriedades CSS
- Testes de funcionalidade de scroll manual

---

## [1.0.11] - 2024-12-28

### 🐛 Fixed - Automatic Scroll Behavior

#### 🔧 Changed
- **COMPORTAMENTO DE SCROLL REMOVIDO**: Removido scroll automático quando novas mensagens chegam
- **CONTROLE DO USUÁRIO**: Posição do scroll agora permanece onde o usuário deixou
- **APARIÇÃO IMEDIATA**: Mensagens ainda aparecem imediatamente mas sem forçar scroll para baixo
- **EXPERIÊNCIA DO USUÁRIO**: Melhorada permitindo controle manual do scroll

#### ✨ Added
- Script de teste `test-scroll-behavior-fix.js` para verificar mudanças no comportamento de scroll
- Funções de teste para verificar scroll manual vs automático
- Documentação sobre mudanças no comportamento de scroll

#### 🐛 Fixed
- **SCROLL AUTOMÁTICO**: Removido scroll automático em atualizações em tempo real
- **SCROLL NO FOCUS**: Removido scroll automático quando a janela ganha foco
- **SCROLL APÓS ENVIAR**: Removido scroll automático após enviar mensagens
- **CONTROLE MANUAL**: Métodos de scroll mantidos para uso manual quando necessário

#### 📚 Documentation
- Scripts de teste para verificar comportamento de scroll
- Funções de teste para scroll manual
- Testes para aparição imediata de mensagens

---

## [1.0.10] - 2024-12-19

### 🐛 Fixed - Infinite Message Loop

#### 🔧 Changed
- **FUNÇÃO `_sendSaveRequestViaSocketLib()`**: Agora retorna `false` quando falha em vez de assumir sucesso
- **FUNÇÃO `handleSendMessage()`**: Adicionada verificação para filtrar mensagens do sistema
- **FUNÇÃO `handleSaveMessages()`**: Corrigida para usar função específica para respostas do sistema
- **NOVA FUNÇÃO `sendSystemResponseToUser()`**: Criada para enviar respostas do sistema sem causar loops

#### ✨ Added
- Script de teste `test-message-loop-fix.js` para verificar correção do loop
- Função `sendSystemResponseToUser()` para respostas do sistema
- Verificações para filtrar mensagens do sistema (`saveMessagesResponse`, `system`)
- Testes para fluxo bidirecional de mensagens

#### 🐛 Fixed
- **LOOP INFINITO DE MENSAGENS**: Corrigido problema de mensagens de resposta do sistema causando loops
- **MENSAGENS DO PLAYER PARA GM**: Agora devem chegar corretamente sem loops
- **SALVAMENTO DE MENSAGENS**: Sistema de salvamento não causa mais loops infinitos
- **CONSOLE LOGS**: Removidos logs repetitivos de "saveMessagesResponse"

#### 📚 Documentation
- Scripts de teste para verificar correção do loop
- Funções de teste para fluxo bidirecional
- Testes para condições originais do loop

---

## [1.0.9] - 2024-12-19

### 🔄 Major Refactoring - Business Rules Implementation

#### 🔧 Changed
- **SISTEMA DE MENSAGENS REFATORADO**: Corrigido salvamento de mensagens para players
- **SISTEMA DE LEITURA/NÃO LEITURA**: Implementado status read/unread nas mensagens
- **NOTIFICAÇÕES SIMPLIFICADAS**: Agora mostra apenas "Nova mensagem no Chat7"
- **MENSAGENS PRIVADAS**: Todas as mensagens são privadas entre participantes
- **CONTADORES EM TEMPO REAL**: Sistema de contadores não lidos baseado em status read/unread

#### ✨ Added
- Script de teste `test-business-rules.js` para verificar implementação das regras
- Sistema de fallback para localStorage quando SocketLib falha
- Função `loadMessages()` para carregar mensagens de diferentes fontes
- Status `read: false` em todas as novas mensagens
- Marcação automática de mensagens como lidas ao abrir chat

#### 🐛 Fixed
- **MENSAGENS DO PLAYER PARA GM**: Corrigido problema de mensagens não chegarem
- **SALVAMENTO DE MENSAGENS**: Players agora conseguem salvar mensagens corretamente
- **CONTADORES DE MENSAGENS**: Sistema agora funciona corretamente com status read/unread
- **NOTIFICAÇÕES**: Seguem as regras especificadas (apenas "Nova mensagem no Chat7")

#### 📚 Documentation
- Scripts de teste para verificar regras de negócio
- Funções de teste para fluxo GM-Player
- Testes de sistema de notificações
- Testes de permissões e controle de acesso

---

## [1.0.8] - 2024-12-19

### 🐛 Fixed - Permission Errors for Non-GM Users

#### 🔧 Changed
- **ESCOPO DE CONFIGURAÇÃO ALTERADO**: Configuração `last-read-timestamps` mudou de `scope: 'world'` para `scope: 'client'`
- **SISTEMA HÍBRIDO DE ARMAZENAMENTO**: GMs usam settings, Players usam localStorage
- **FUNÇÕES ROBUSTAS**: `_saveReadTimestamps()` e `_loadReadTimestamps()` com fallback para localStorage
- **VERIFICAÇÃO DE PERMISSÕES**: Sistema detecta automaticamente o papel do usuário

#### ✨ Added
- Script de teste `test-permissions-fix.js` para verificar o fix
- Sistema de fallback para localStorage quando settings falham
- Funções de teste para verificar permissões e localStorage

#### 📚 Documentation
- Documentação sobre o fix de permissões (`docs/PERMISSIONS-FIX.md`)
- Instruções de como testar o fix de permissões

---

## [1.0.7] - 2024-12-19

### 🐛 Fixed - SocketLib Error Logs

#### 🔧 Changed
- **VERIFICAÇÃO DE DISPONIBILIDADE MAIS FLEXÍVEL**: Função `_isSocketLibAvailable()` agora é menos restritiva
- **LOGS DE ERRO REDUZIDOS**: Substituídos `console.error()` por `console.warn()` para logs de SocketLib
- **NOTIFICAÇÕES REMOVIDAS**: Não são mais exibidas notificações de erro quando SocketLib está funcionando
- **FUNÇÕES MAIS TOLERANTES**: Funções não retornam `false` desnecessariamente quando SocketLib não está disponível

#### ✨ Added
- Script de teste `test-socketlib-fix.js` para verificar o fix
- Documentação detalhada sobre o fix do SocketLib
- Funções de teste para verificar status do SocketLib

#### 📚 Documentation
- Documentação sobre o fix do SocketLib (`docs/SOCKETLIB-FIX.md`)
- Instruções de como testar o fix

---

## [1.0.6] - 2024-12-19

### 🔄 Major Refactoring - SocketLib Only Communication

#### ✨ Added
- SocketLib agora é obrigatório como dependência
- Melhor tratamento de erros para comunicação SocketLib
- Notificações de erro mais informativas para usuários

#### 🗑️ Removed
- **Removido completamente** suporte a socket nativo do FoundryVTT
- **Removido completamente** sistema de comunicação via chat
- **Removido** configuração de método de comunicação (agora apenas SocketLib)
- **Removido** funções de fallback para socket nativo e chat
- **Removido** listeners de chat para eventos do sistema
- **Removido** funções de teste para socket nativo e chat

#### 🔧 Changed
- **REFATORAÇÃO MAJOR**: Módulo agora usa exclusivamente SocketLib para comunicação
- Simplificação significativa do código de comunicação
- Melhorias na estabilidade e performance da comunicação
- Código mais limpo e fácil de manter
- Todas as funções de comunicação agora verificam se SocketLib está disponível
- Mensagens de erro mais claras quando SocketLib não está disponível

#### 🐛 Fixed
- Eliminação de conflitos entre diferentes métodos de comunicação
- Melhor consistência na comunicação entre clientes
- Redução de bugs relacionados a métodos de comunicação mistos
- **CRÍTICO**: Adicionado `"socket": true` no `module.json` para compatibilidade com SocketLib
- Validação de métodos do SocketLib para evitar chamadas de funções indefinidas
- Verificações seguras para todos os métodos do SocketLib

#### 📚 Documentation
- README atualizado para refletir mudanças
- Documentação sobre por que apenas SocketLib é usado
- Instruções de instalação atualizadas

---

## [1.0.5] - 2024-12-18

### ✨ Added
- Sistema de mute para contatos
- Contatos anônimos para mensagens de jogadores não adicionados
- Melhorias na interface de usuário
- Sistema de notificações sonoras aprimorado

### 🔧 Changed
- Melhorias na performance do sistema de mensagens
- Interface mais responsiva
- Melhor integração com o chat do FoundryVTT

### 🐛 Fixed
- Correções em bugs de sincronização
- Melhorias na estabilidade da comunicação em tempo real

---

## [1.0.4] - 2024-12-17

### ✨ Added
- Sistema de mensagens em tempo real
- Integração com SocketLib
- Interface cyberpunk moderna
- Gerenciamento de contatos

### 🔧 Changed
- Melhorias na interface de usuário
- Otimizações de performance

### 🐛 Fixed
- Correções em bugs de interface
- Melhorias na estabilidade

---

## [1.0.3] - 2024-12-16

### ✨ Added
- Sistema básico de mensagens
- Interface inicial do Agent
- Integração básica com FoundryVTT

### 🔧 Changed
- Melhorias na estrutura do código
- Otimizações iniciais

---

## [1.0.2] - 2024-12-15

### ✨ Added
- Estrutura inicial do módulo
- Configurações básicas
- Sistema de localização

---

## [1.0.1] - 2024-12-14

### ✨ Added
- Primeira versão do módulo
- Estrutura básica
- Manifesto do módulo

---

## [1.0.0] - 2024-12-13

### ✨ Added
- Lançamento inicial do Cyberpunk Agent
- Sistema básico de mensagens
- Interface cyberpunk
- Integração com FoundryVTT 