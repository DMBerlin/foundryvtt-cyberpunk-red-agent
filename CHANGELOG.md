# Changelog

All notable changes to this project will be documented in this file.

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