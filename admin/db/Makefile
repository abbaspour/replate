# Replate CRM Database Makefile

DB_FILE = admin.sqlite
DDL_FILE = admin-ddl.sql
DROP_FILE = admin-drop.sql
D1_DB_NAME = replate-admin

.PHONY: help init load clean d1-init d1-load d1-users d1-companies d1-donations d1-schedules d1-jobs d1-suggestions

help:
	@echo "Available targets:"
	@echo "  init          - Initialize SQLite database with schema from ddl.sql"
	@echo "  load          - Load sample data from init.sql"
	@echo "  clean         - Remove the database file"
	@echo "  drop          - Remove the database file"
	@echo "  d1-init       - Initialize remote Cloudflare D1 database with schema"
	@echo "  d1-drop       - Drops D1 database"
	@echo "  d1-users      - List all users from D1 database"
	@echo "  d1-org        - List all orgs from D1 database"
	@echo "  help          - Show this help message"

init: $(DB_FILE)

$(DB_FILE): $(DDL_FILE)
	@echo "Initializing SQLite database with schema..."
	sqlite3 $(DB_FILE) < $(DDL_FILE)
	@echo "Database initialized successfully: $(DB_FILE)"

load: $(DB_FILE) $(INIT_FILE)
	@echo "Loading sample data..."
	sqlite3 $(DB_FILE) < $(INIT_FILE)
	@echo "Sample data loaded successfully"

d1-init:
	@echo "Initializing remote Cloudflare D1 database with schema..."
	wrangler d1 execute $(D1_DB_NAME) -y --file=$(DDL_FILE) --remote
	@echo "Remote D1 database initialized successfully"

d1-load:
	@echo "Loading sample data to remote Cloudflare D1 database..."
	wrangler d1 execute $(D1_DB_NAME) -y --file=$(INIT_FILE) --remote
	@echo "Sample data loaded to remote D1 database successfully"

d1-drop:
	@echo "Dropping tables from remote Cloudflare D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --file=$(DROP_FILE) --remote
	@echo "Tables dropped from remote D1 database successfully"

d1-list:
	wrangler d1 list

d1-info:
	wrangler d1 info $(D1_DB_NAME)

d1-users:
	@echo "Listing all users from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT * FROM Users ORDER BY id;" --remote

d1-orgs:
	@echo "Listing all companies from D1 Orgs..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT * FROM Organizations ORDER BY org_type, id;" --remote

drop: clean

clean:
	@echo "Removing database file..."
	rm -f $(DB_FILE)
	@echo "Database file removed"