# Cyberpunk Agent v2.0.0

Um módulo do FoundryVTT que adiciona um sistema de mensagens estilo cyberpunk para que os jogadores se comuniquem através dos agentes de seus personagens.

## Características

- **Sistema Baseado em Equipamento**: O Agent só aparece nos controles quando equipado
- **Dispositivos Únicos**: Cada item "Agent" no inventário se torna um dispositivo separado
- **Controles Dinâmicos**: O ícone do telefone aparece/desaparece automaticamente baseado no estado de equipamento
- **Tooltips Informativos**: Mostra o nome do personagem ao passar o mouse sobre o ícone
- **Acesso GM Completo**: GM sempre tem acesso a todos os dispositivos via controles de token
- **Sistema de Mensagens em Tempo Real**: Comunicação instantânea entre jogadores usando SocketLib
- **Sincronização Automática**: Mensagens são automaticamente sincronizadas quando o agente é aberto
- **Interface Cyberpunk**: Design moderno e temático para o sistema de mensagens
- **Gerenciamento de Contatos**: Adicione, remova e organize seus contatos por dispositivo
- **Adição de Contatos via Chat7**: Menu de contexto para adicionar contatos diretamente na interface Chat7
- **Números de Telefone Únicos**: Cada Agent tem um número único derivado de sua chave
- **Mensagens Privadas**: Opção para tornar as mensagens privadas entre participantes
- **Notificações Sonoras**: Sons de notificação para novas mensagens
- **Integração com FoundryVTT**: Sincronização com o chat do FoundryVTT
- **Sistema de Mute Isolado**: Mute contatos específicos para cada dispositivo independentemente
- **Histórico Isolado**: Cada dispositivo mantém seu próprio histórico de conversas
- **Sistema de Requisições GM**: Jogadores podem solicitar ações GM via SocketLib para salvar dados do mundo

## Requisitos

- **FoundryVTT v11** ou superior
- **SocketLib** (obrigatório) - [Download aqui](https://github.com/farling42/foundryvtt-socketlib/releases)
- **Sistema Cyberpunk RED Core** (recomendado)

## Instalação

1. **Instale o SocketLib primeiro**:
   - Baixe o SocketLib do [GitHub](https://github.com/farling42/foundryvtt-socketlib/releases)
   - Instale o módulo no FoundryVTT

2. **Instale o Cyberpunk Agent**:
   - Baixe o módulo do [GitHub](https://github.com/dmberlin/cyberpunk-agent/releases)
   - Instale o módulo no FoundryVTT
   - Ative o módulo na sua campanha

## Uso

### Sistema Baseado em Equipamento

O Cyberpunk Agent v2.0.0 funciona baseado no estado de equipamento dos itens "Agent":

- **Equipado**: O ícone do telefone aparece nos controles do token
- **Não Equipado**: O ícone do telefone desaparece dos controles
- **Múltiplos Agentes**: Se você tem mais de um Agent equipado, aparece um menu de seleção

### Acessando o Agent

**Para Jogadores:**
- **Token Controls**: O ícone do telefone aparece automaticamente quando um Agent está equipado
- **Chat Command**: Digite `/agent` no chat para acessar seus dispositivos equipados
- **Tooltip**: Passando o mouse sobre o ícone mostra o nome do personagem

**Para GMs:**
- **Token Controls**: O ícone do telefone aparece sempre, dando acesso a TODOS os dispositivos registrados no sistema
- **Chat Command**: Digite `/agent` no chat para acessar todos os dispositivos registrados
- **Acesso Completo**: GM pode operar qualquer dispositivo no sistema, atuando como qualquer personagem

### Enviando Mensagens

1. Abra o Agent
2. Selecione um contato da sua lista
3. Digite sua mensagem
4. Pressione Enter para enviar

### Gerenciando Equipamento

**Para Jogadores:**
1. Abra a ficha do seu personagem
2. Vá para a aba "Gear" (Equipamento)
3. Encontre o item "Agent" no seu inventário
4. Clique no ícone de equipar (⚔️) para equipar o Agent
5. O ícone do telefone aparecerá automaticamente nos controles do token

**Para GMs:**
- O ícone do telefone aparece sempre nos controles de token, independente do token selecionado
- Acessa TODOS os dispositivos registrados no sistema
- Pode operar qualquer dispositivo, atuando como qualquer personagem
- Menu de seleção mostra todos os dispositivos disponíveis com nomes dos proprietários

### Gerenciando Contatos

**Adicionando Contatos via Chat7:**
1. Abra o Agent e navegue para o Chat7
2. Clique com o botão direito na área de fundo da lista de contatos
3. Selecione "Adicionar Contato" no menu de contexto
4. Digite o número de telefone no formato não formatado (ex: `14152120002`)
5. Clique em "Buscar" ou pressione Enter
6. Se o contato for encontrado, clique em "Adicionar Contato"

**Adicionando Contatos via Contact Manager (GM):**
1. Abra o Agent
2. Clique em "Gerenciar Contatos"
3. Adicione ou remova contatos conforme necessário

**Adição Automática de Contatos:**
- **Adição Manual**: Quando um dispositivo adiciona outro manualmente, apenas o dispositivo que fez a adição tem o contato em sua lista
- **Awareness por Mensagem**: O dispositivo adicionado só fica ciente do dispositivo que o adicionou quando recebe uma mensagem
- **Adição Recíproca Automática**: Quando um dispositivo envia uma mensagem, ambos são automaticamente adicionados às listas de contatos um do outro
- **Comunicação Natural**: As listas de contatos crescem organicamente através da comunicação, não apenas da adição manual
- **Atualizações em Tempo Real**: As listas de contatos são atualizadas imediatamente e sincronizadas entre todos os clientes

**Números de Telefone:**
- Cada Agent tem um número único derivado de sua chave
- Os números são exibidos no formato `+1 (415) 212-0002` na tela inicial
- Para adicionar contatos, use o formato não formatado: `14152120002`
- Adições são recíprocas: se A adiciona B, B também recebe A como contato
- **Atribuição Imediata**: Números são atribuídos automaticamente quando um Agent é adicionado ao equipamento do ator
- **Limpeza Automática**: Quando um Agent é removido do equipamento, seu número é automaticamente removido do sistema
- **Sincronização Manual**: Script de sincronização disponível para registrar Agents que possam ter sido perdidos

### Configurações

- **Mensagens Privadas**: Torna as mensagens visíveis apenas para os participantes
- **Som de Notificação**: Ativa/desativa sons para novas mensagens

### Melhorias para GM (v2.1.0)

**Acesso Completo para GM:**
- **Acesso Universal**: GM pode operar qualquer dispositivo registrado no sistema
- **Operação como Personagem**: GM pode atuar como qualquer personagem com dispositivo
- **Menu de Seleção Completo**: Mostra todos os dispositivos com nomes dos proprietários
- **Controles de Token**: Ícone do agent aparece sempre, independente do token selecionado
- **Flexibilidade Total**: GM pode enviar mensagens como qualquer personagem para facilitar roleplay

### Sincronização de Agents

O Cyberpunk Agent inclui funções de sincronização para garantir que todos os Agents equipados estejam devidamente registrados:

**Executando a Sincronização:**
1. Abra o console do navegador no FoundryVTT (F12)
2. Execute: `window.cyberpunkAgent.syncAllAgents()` para sincronização completa
3. Ou execute: `window.cyberpunkAgent.quickSyncAgents()` para verificação rápida

**O que as funções fazem:**
- Escaneiam todos os atores na campanha
- Identificam Agents equipados que não estão registrados
- Criam dispositivos e atribuem números de telefone automaticamente
- Salvam todos os dados no sistema
- Exibem relatório detalhado do processo

### Sistema Híbrido de Nomes de Proprietários

O sistema agora inclui um mecanismo híbrido para gerenciar os nomes dos proprietários dos devices:

#### **Atualizações em Tempo Real**
- Quando um ator é renomeado, todos os devices associados são atualizados automaticamente
- As mudanças são salvas imediatamente no registro

#### **Funções de Console Disponíveis**
- `window.cyberpunkAgent.migrateOwnerNames()` - Migra devices existentes para incluir nomes de proprietários
- `window.cyberpunkAgent.updateAllOwnerNames()` - Força atualização de todos os nomes de proprietários
- `window.cyberpunkAgent.getDeviceOwnerName(deviceId)` - Obtém nome do proprietário com fallback

#### **Mecanismo de Fallback**
- Se um device não tem o nome do proprietário armazenado, o sistema busca automaticamente no ator
- Garante que os nomes sempre estejam atualizados mesmo se houver falhas na sincronização

#### **Teste do Sistema**
Execute no console: `window.cyberpunkAgent.syncAllAgents()` para ver os nomes dos proprietários no registro.

### Acesso GM Universal (v2.1.0)

O GM agora tem acesso universal a todos os dispositivos registrados no sistema:

#### **Comportamento do GM**
- **Controles de Token**: O ícone do agent aparece sempre, independente do token selecionado
- **Acesso Completo**: GM pode operar qualquer dispositivo registrado no sistema
- **Operação como Personagem**: GM pode atuar como qualquer personagem com dispositivo
- **Menu de Seleção**: Mostra todos os dispositivos com nomes dos proprietários e números de telefone

#### **Comportamento do Jogador**
- **Controles de Token**: O ícone do agent aparece apenas quando o jogador tem agents equipados
- **Acesso Limitado**: Jogadores só podem acessar seus próprios dispositivos equipados
- **Operação Própria**: Jogadores só podem operar seus próprios dispositivos

#### **Funções de Console para GM**
- `window.cyberpunkAgent.getAllRegisteredDevices()` - Lista todos os dispositivos disponíveis
- `window.cyberpunkAgent.showAllDevicesMenu(devices)` - Mostra menu de seleção de dispositivos
- `window.cyberpunkAgent.openSpecificAgent(deviceId)` - Abre dispositivo específico

#### **Teste do Acesso GM**
Execute no console: `window.cyberpunkAgent.getAllRegisteredDevices()` para ver todos os dispositivos disponíveis para o GM.

### Sistema de Requisições GM

O Cyberpunk Agent implementa um sistema inteligente de requisições GM que permite que jogadores executem ações que requerem permissões de GM de forma transparente:

- **Salvamento Automático**: Quando um jogador adiciona contatos ou modifica dados, o sistema automaticamente solicita ao GM para salvar as alterações
- **Notificações em Tempo Real**: Jogadores recebem feedback imediato sobre o status de suas requisições
- **Fallback Gracioso**: Se o SocketLib não estiver disponível, o sistema notifica o jogador sobre a necessidade de ação GM
- **Segurança Mantida**: Apenas GMs podem modificar configurações do mundo, mantendo a integridade dos dados

**Para GMs**: As requisições são processadas automaticamente - não é necessária ação manual.

**Para Jogadores**: Continue usando o sistema normalmente. As requisições GM são enviadas automaticamente quando necessário.

## Comunicação

Este módulo usa **exclusivamente o SocketLib** para comunicação em tempo real entre clientes. O SocketLib é obrigatório e deve ser instalado antes do Cyberpunk Agent.

### Por que apenas SocketLib?

- **Confiabilidade**: SocketLib oferece comunicação WebSocket robusta
- **Performance**: Melhor performance que métodos alternativos
- **Simplicidade**: Um único método de comunicação elimina complexidade
- **Manutenibilidade**: Código mais limpo e fácil de manter

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no [GitHub](https://github.com/dmberlin/cyberpunk-agent/issues)
- Consulte a documentação na pasta `docs/`

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Changelog

### v1.0.54
- **Sistema de Sincronização de Mensagens**: Implementada sincronização automática de mensagens quando o agente é aberto
- **Comunicação Cross-Client**: Sistema busca mensagens de outros clientes automaticamente
- **Prevenção de Duplicatas**: Verificações para evitar mensagens duplicadas durante sincronização
- **Testes Automatizados**: Scripts de teste para verificar a sincronização funcionando corretamente

### v1.0.52
- **Sistema de Isolamento por Actor**: Implementado isolamento completo de configurações de mute e histórico de mensagens por personagem
- **Migração Automática**: Sistema automático de migração de dados existentes para o novo formato
- **Backup e Rollback**: Sistema de backup automático com capacidade de rollback
- **Testes Automatizados**: Scripts de teste para verificar o isolamento funcionando corretamente

### v1.0.6
- **REFATORAÇÃO MAJOR**: Módulo agora usa exclusivamente SocketLib para comunicação
- Removido suporte a socket nativo e chat como métodos de comunicação
- SocketLib agora é obrigatório (dependência)
- Melhorias na estabilidade e performance da comunicação
- Código simplificado e mais fácil de manter

### Versões Anteriores
- Sistema de mensagens em tempo real
- Interface cyberpunk
- Gerenciamento de contatos
- Integração com FoundryVTT
- Sistema de mute
- Contatos anônimos 