-- Replate Project DDL for Cloudflare D1 (SQLite)
-- Generated on: 2025-09-03

-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS SsoInvitations;
DROP TABLE IF EXISTS Suggestions;
DROP TABLE IF EXISTS PickupJobs;
DROP TABLE IF EXISTS PickupSchedules;
DROP TABLE IF EXISTS Donations;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Organizations;

-------------------------------------------------
-- Table: Organizations
-- Represents a Supplier, Community, or Logistics organization.
-------------------------------------------------
CREATE TABLE Organizations (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         auth0_org_id TEXT UNIQUE NOT NULL,
                         org_type TEXT NOT NULL CHECK(org_type IN ('supplier', 'community', 'logistics')),
                         name TEXT NOT NULL,
                         domain TEXT, -- Single domain used for HRD (e.g., 'acme.com')
                         sso_status TEXT DEFAULT 'not_started' CHECK(sso_status IN ('not_started', 'invited', 'configured', 'active')),
                         pickup_address TEXT,
                         delivery_address TEXT,
                         coverage_regions TEXT,
                         vehicle_types TEXT, -- Stored as a JSON array string '["van", "truck"]'
                         created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_organizations_auth0_org_id ON Organizations(auth0_org_id);
CREATE INDEX idx_organizations_org_type ON Organizations(org_type);


-------------------------------------------------
-- Table: Users
-- Represents any user of the system, consumer or business.
-------------------------------------------------
CREATE TABLE Users (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         auth0_user_id TEXT UNIQUE NOT NULL,
                         organization_id INTEGER,
                         email TEXT NOT NULL,
                         email_verified INTEGER NOT NULL DEFAULT 0, -- Boolean (0=false, 1=true)
                         name TEXT,
                         picture TEXT,
                         donor INTEGER NOT NULL DEFAULT 0, -- Boolean
                         org_role TEXT CHECK(org_role IN ('admin', 'member', 'driver')),
                         org_status TEXT CHECK(org_status IN ('invited', 'active', 'suspended')),
                         consumer_lifecycle_stage TEXT DEFAULT 'registered' CHECK(consumer_lifecycle_stage IN ('visitor', 'registered', 'donor_first_time', 'donor_repeat', 'advocate')),
                         created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (organization_id) REFERENCES Organizations(id)
);
CREATE INDEX idx_users_auth0_user_id ON Users(auth0_user_id);
CREATE INDEX idx_users_organization_id ON Users(organization_id);


-------------------------------------------------
-- Table: Donations
-- Tracks monetary donations from consumer users.
-------------------------------------------------
CREATE TABLE Donations (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          auth0_user_id TEXT NOT NULL,
                          amount REAL NOT NULL,
                          currency TEXT NOT NULL,
                          status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed')),
                          testimonial TEXT,
                          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_donations_auth0_user_id ON Donations(auth0_user_id);


-------------------------------------------------
-- Table: PickupSchedules
-- Defines the recurring pickup arrangements (standing orders).
-------------------------------------------------
CREATE TABLE PickupSchedules (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                supplier_id INTEGER NOT NULL,
                                default_community_id INTEGER,
                                is_active INTEGER NOT NULL DEFAULT 1, -- Boolean
                                cron_expression TEXT NOT NULL,
                                pickup_time_of_day TEXT NOT NULL, -- Format 'HH:MM:SS'
                                pickup_duration_minutes INTEGER NOT NULL,
                                default_food_category TEXT, -- Stored as a JSON array string
                                default_estimated_weight_kg REAL,
                                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (supplier_id) REFERENCES Organizations(id),
                                FOREIGN KEY (default_community_id) REFERENCES Organizations(id)
);
CREATE INDEX idx_pickupschedules_supplier_id ON PickupSchedules(supplier_id);


-------------------------------------------------
-- Table: PickupJobs
-- Tracks the lifecycle of a single, concrete pickup event.
-------------------------------------------------
CREATE TABLE PickupJobs (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           schedule_id INTEGER, -- Nullable for ad-hoc jobs
                           supplier_id INTEGER NOT NULL,
                           community_id INTEGER,
                           logistics_id INTEGER,
                           driver_auth0_user_id TEXT,
                           status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Triage', 'Logistics Assigned', 'In Transit', 'Delivered', 'Canceled')),
                           pickup_window_start TEXT, -- ISO 8601 format
                           pickup_window_end TEXT,   -- ISO 8601 format
                           food_category TEXT,
                           estimated_weight_kg REAL,
                           packaging TEXT,
                           handling_notes TEXT,
                           created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (schedule_id) REFERENCES PickupSchedules(id),
                           FOREIGN KEY (supplier_id) REFERENCES Organizations(id),
                           FOREIGN KEY (community_id) REFERENCES Organizations(id),
                           FOREIGN KEY (logistics_id) REFERENCES Organizations(id)
);
CREATE INDEX idx_pickupjobs_status ON PickupJobs(status);
CREATE INDEX idx_pickupjobs_supplier_id ON PickupJobs(supplier_id);
CREATE INDEX idx_pickupjobs_driver_auth0_user_id ON PickupJobs(driver_auth0_user_id);


-------------------------------------------------
-- Table: Suggestions
-- Captures new partner leads submitted by consumers.
-------------------------------------------------
CREATE TABLE Suggestions (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            submitter_auth0_user_id TEXT NOT NULL,
                            converted_organization_id INTEGER, -- The organization created from this suggestion
                            type TEXT NOT NULL CHECK(type IN ('supplier', 'community', 'logistics')),
                            name TEXT NOT NULL,
                            address TEXT,
                            qualification_status TEXT NOT NULL DEFAULT 'New' CHECK(qualification_status IN ('New', 'Contacted', 'Qualified', 'Rejected')),
                            submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (converted_organization_id) REFERENCES Organizations(id)
);
CREATE INDEX idx_suggestions_submitter_auth0_user_id ON Suggestions(submitter_auth0_user_id);


-------------------------------------------------
-- Triggers for automatically updating the 'updated_at' timestamp
-------------------------------------------------
CREATE TRIGGER update_organizations_updated_at
    AFTER UPDATE ON Organizations
    FOR EACH ROW
BEGIN
    UPDATE Organizations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_users_updated_at
    AFTER UPDATE ON Users
    FOR EACH ROW
BEGIN
    UPDATE Users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_pickupschedules_updated_at
    AFTER UPDATE ON PickupSchedules
    FOR EACH ROW
BEGIN
    UPDATE PickupSchedules SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_pickupjobs_updated_at
    AFTER UPDATE ON PickupJobs
    FOR EACH ROW
BEGIN
    UPDATE PickupJobs SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-------------------------------------------------
-- Table: SsoInvitations
-- Captures self-service SSO Invitations for an organization
-------------------------------------------------
CREATE TABLE SsoInvitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    issuer_auth0_user_id TEXT,
    display_name TEXT,
    link TEXT NOT NULL,
    auth0_ticket_id TEXT,
    auth0_connection_name TEXT,
    domain_verification TEXT CHECK(domain_verification IN ('Off','Optional','Required')),
    accept_idp_init_saml INTEGER NOT NULL DEFAULT 0,
    ttl INTEGER NOT NULL DEFAULT 432000, -- seconds
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES Organizations(id)
);
CREATE INDEX idx_ssoinv_org_id ON SsoInvitations(organization_id);
CREATE INDEX idx_ssoinv_created_at ON SsoInvitations(created_at);
CREATE INDEX idx_ssoinv_issuer_auth0_user_id ON SsoInvitations(issuer_auth0_user_id);