# Replate CRM Database Makefile

DB_FILE = crm.sqlite
DDL_FILE = ddl.sql
INIT_FILE = sample-init.sql
D1_DB_NAME = replate-crm

.PHONY: help init load clean d1-init d1-load d1-users d1-companies d1-donations d1-schedules d1-jobs d1-suggestions

help:
	@echo "Available targets:"
	@echo "  init          - Initialize SQLite database with schema from ddl.sql"
	@echo "  load          - Load sample data from init.sql"
	@echo "  d1-init       - Initialize remote Cloudflare D1 database with schema"
	@echo "  d1-load       - Load sample data to remote Cloudflare D1 database"
	@echo "  d1-users      - List all users from D1 database"
	@echo "  d1-companies  - List all companies from D1 database"
	@echo "  d1-donations  - List all donations from D1 database"
	@echo "  d1-schedules  - List all pickup schedules from D1 database"
	@echo "  d1-jobs       - List all pickup jobs from D1 database"
	@echo "  d1-suggestions - List all suggestions from D1 database"
	@echo "  clean         - Remove the database file"
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
	wrangler d1 execute $(D1_DB_NAME) --file=$(DDL_FILE) --remote
	@echo "Remote D1 database initialized successfully"

d1-load:
	@echo "Loading sample data to remote Cloudflare D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --file=$(INIT_FILE) --remote
	@echo "Sample data loaded to remote D1 database successfully"

d1-users:
	@echo "Listing all users from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT id, name, email, donor, org_role, consumer_lifecycle_stage FROM User ORDER BY id;" --remote

d1-companies:
	@echo "Listing all companies from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT id, name, org_type, sso_status FROM Company ORDER BY org_type, id;" --remote

d1-donations:
	@echo "Listing all donations from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT d.id, u.name as donor_name, d.amount, d.currency, d.status, d.created_at FROM Donation d JOIN User u ON d.user_id = u.id ORDER BY d.created_at DESC;" --remote

d1-schedules:
	@echo "Listing all pickup schedules from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT ps.id, s.name as supplier_name, c.name as community_name, ps.is_active, ps.cron_expression FROM PickupSchedule ps JOIN Company s ON ps.supplier_id = s.id LEFT JOIN Company c ON ps.default_community_id = c.id ORDER BY ps.id;" --remote

d1-jobs:
	@echo "Listing all pickup jobs from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT pj.id, s.name as supplier_name, pj.status, pj.pickup_window_start, pj.estimated_weight_kg FROM PickupJob pj JOIN Company s ON pj.supplier_id = s.id ORDER BY pj.created_at DESC;" --remote

d1-suggestions:
	@echo "Listing all suggestions from D1 database..."
	wrangler d1 execute $(D1_DB_NAME) --command="SELECT sg.id, u.name as submitter_name, sg.type, sg.name as suggested_name, sg.qualification_status FROM Suggestion sg JOIN User u ON sg.submitter_id = u.id ORDER BY sg.submitted_at DESC;" --remote

clean:
	@echo "Removing database file..."
	rm -f $(DB_FILE)
	@echo "Database file removed"