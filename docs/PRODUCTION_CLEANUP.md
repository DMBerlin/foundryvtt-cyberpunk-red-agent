# Cyberpunk Agent - Production Cleanup

## Functions to Remove

### Debug Functions:
- window.cyberpunkAgentFixTokenControls
- window.cyberpunkAgentTestContactLogic  
- window.cyberpunkAgentTestNPCMessaging
- window.cyberpunkAgentDebugActorDevices
- window.cyberpunkAgentDebugChat7
- window.cyberpunkAgentDebugNavigation
- window.cyberpunkAgentTestPlayerMessaging
- window.cyberpunkAgentTestOfflineQueue
- window.cyberpunkAgentDebugOfflineMessages
- window.cyberpunkAgentDebugGMMessaging
- window.cyberpunkAgentSyncWithServer
- window.cyberpunkAgentTestGMConnection
- window.cyberpunkAgentTestOfflinePlayerSync

### Legacy Test Functions:
- window.testContactNetworkPersistence
- window.testPlayerContactNetworkAccess
- window.testMessagePersistence
- window.testRealtimeCommunication
- window.testSocketLibSetup

### Functions to Keep:
- window.cyberpunkAgentMasterReset (Essential GM function)
- window.cyberpunkAgentCheckStatus (Essential GM function)

## Logs to Clean:
- Excessive device loading logs
- Debug console.log statements
- Development troubleshooting logs
- Keep only error logs and essential status logs
