# Replate CRM Database Makefile

DB_FILE = business.sqlite
DDL_FILE = business-ddl.sql
DROP_FILE = business-drop.sql
D1_DB_NAME = replate-business

.PHONY: help init load clean d1-init d1-load d1-users d1-companies d1-donations d1-schedules d1-jobs d1-suggestions

help:
	@echo "Available targets:"
	@echo "  init          - Initialize SQLite database with schema from ddl.sql"
	@echo "  load          - Load sample data from init.sql"
	@echo "  clean         - Remove the database file"
	@echo "  drop          - Remove the database file"
	@echo "  d1-init       - Initialize remote Cloudflare D1 database with schema"
	@echo "  d1-drop       - Drops D1 database"
	@echo "  d1-schedules  - List all pickup schedules from D1 database"
	@echo "  d1-jobs       - List all pickup jobs from D1 database"
	@echo "  help          - Show this help message"

init: $(DB_FILE)

$(DB_FILE): $(DDL_FILE)
	@echo "Initializing SQLite database with schema..."
	sqlite3 $(DB_FILE) < $(DDL_FILE)
	@echo "Database initialized successfully: $(DB_FILE)"

d1-init:
	@echo "Initializing remote Cloudflare D1 database with schema..."
	wrangler d1 execute $(D1_DB_NAME) -y --file=$(DDL_FILE) --remote
	@echo "Remote D1 database initialized successfully"

d1-drop:
	@echo "Dropping tables from remote Cloudflare D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --file=$(DROP_FILE) --remote
	@echo "Tables dropped from remote D1 database successfully"

d1-list:
	wrangler d1 list

d1-info:
	wrangler d1 info $(D1_DB_NAME)

d1-schedules:
	@echo "Listing all pickup schedules from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT ps.id, s.name as supplier_name, c.name as community_name, ps.is_active, ps.cron_expression FROM PickupSchedule ps JOIN Company s ON ps.supplier_id = s.id LEFT JOIN Company c ON ps.default_community_id = c.id ORDER BY ps.id;" --remote

d1-jobs:
	@echo "Listing all pickup jobs from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT pj.id, s.name as supplier_name, pj.status, pj.pickup_window_start, pj.estimated_weight_kg FROM PickupJob pj JOIN Company s ON pj.supplier_id = s.id ORDER BY pj.created_at DESC;" --remote

drop: clean

clean:
	@echo "Removing database file..."
	rm -f $(DB_FILE)
	@echo "Database file removed"