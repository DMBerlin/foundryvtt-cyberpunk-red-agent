# FoundryVTT Development Makefile

# Load environment variables from .env.local if it exists
ifneq (,$(wildcard .env.local))
    include .env.local
    export
endif

.PHONY: start stop

start:
	@echo "Starting FoundryVTT on http://localhost:$(FOUNDRY_APP_PORT)"
	node $(FOUNDRY_APP_PATH)/main.mjs --port=$(FOUNDRY_APP_PORT)

stop:
	@echo "Stopping FoundryVTT..."
	@lsof -ti:$(FOUNDRY_APP_PORT) | xargs kill -9 2>/dev/null || echo "No process found on port $(FOUNDRY_APP_PORT)"
