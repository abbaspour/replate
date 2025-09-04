# Replate CRM Database Makefile

DB_FILE = crm.sqlite
DDL_FILE = ddl.sql
INIT_FILE = sample-init.sql

.PHONY: help init load clean

help:
	@echo "Available targets:"
	@echo "  init  - Initialize SQLite database with schema from ddl.sql"
	@echo "  load  - Load sample data from init.sql"
	@echo "  clean - Remove the database file"
	@echo "  help  - Show this help message"

init: $(DB_FILE)

$(DB_FILE): $(DDL_FILE)
	@echo "Initializing SQLite database with schema..."
	sqlite3 $(DB_FILE) < $(DDL_FILE)
	@echo "Database initialized successfully: $(DB_FILE)"

load: $(DB_FILE) $(INIT_FILE)
	@echo "Loading sample data..."
	sqlite3 $(DB_FILE) < $(INIT_FILE)
	@echo "Sample data loaded successfully"

clean:
	@echo "Removing database file..."
	rm -f $(DB_FILE)
	@echo "Database file removed"