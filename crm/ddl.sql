-- Replate Project DDL for Cloudflare D1 (SQLite)
-- Generated on: 2025-09-03

-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS Suggestion;
DROP TABLE IF EXISTS PickupJob;
DROP TABLE IF EXISTS PickupSchedule;
DROP TABLE IF EXISTS Donation;
DROP TABLE IF EXISTS Contact;
DROP TABLE IF EXISTS Organization;

-------------------------------------------------
-- Table: Organization
-- Represents a Supplier, Community, or Logistics organization.
-------------------------------------------------
CREATE TABLE Organization (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         auth0_org_id TEXT UNIQUE NOT NULL,
                         org_type TEXT NOT NULL CHECK(org_type IN ('supplier', 'community', 'logistics')),
                         name TEXT NOT NULL,
                         domains TEXT, -- Stored as a JSON array string '["domain1.com", "domain2.com"]'
                         sso_status TEXT DEFAULT 'not_started' CHECK(sso_status IN ('not_started', 'invited', 'configured', 'active')),
                         pickup_address TEXT,
                         delivery_address TEXT,
                         coverage_regions TEXT,
                         vehicle_types TEXT, -- Stored as a JSON array string '["van", "truck"]'
                         created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_organization_auth0_org_id ON Organization(auth0_org_id);
CREATE INDEX idx_organization_org_type ON Organization(org_type);


-------------------------------------------------
-- Table: Contact
-- Represents any user of the system, consumer or business.
-------------------------------------------------
CREATE TABLE Contact (
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
                         FOREIGN KEY (organization_id) REFERENCES Organization(id)
);
CREATE INDEX idx_contact_auth0_user_id ON Contact(auth0_user_id);
CREATE INDEX idx_contact_organization_id ON Contact(organization_id);


-------------------------------------------------
-- Table: Donation
-- Tracks monetary donations from consumer users.
-------------------------------------------------
CREATE TABLE Donation (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          contact_id INTEGER NOT NULL,
                          amount REAL NOT NULL,
                          currency TEXT NOT NULL,
                          status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed')),
                          testimonial TEXT,
                          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (contact_id) REFERENCES Contact(id)
);
CREATE INDEX idx_donation_contact_id ON Donation(contact_id);


-------------------------------------------------
-- Table: PickupSchedule
-- Defines the recurring pickup arrangements (standing orders).
-------------------------------------------------
CREATE TABLE PickupSchedule (
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
                                FOREIGN KEY (supplier_id) REFERENCES Organization(id),
                                FOREIGN KEY (default_community_id) REFERENCES Organization(id)
);
CREATE INDEX idx_pickupschedule_supplier_id ON PickupSchedule(supplier_id);


-------------------------------------------------
-- Table: PickupJob
-- Tracks the lifecycle of a single, concrete pickup event.
-------------------------------------------------
CREATE TABLE PickupJob (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           schedule_id INTEGER, -- Nullable for ad-hoc jobs
                           supplier_id INTEGER NOT NULL,
                           community_id INTEGER,
                           logistics_id INTEGER,
                           driver_id INTEGER,
                           status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Triage', 'Logistics Assigned', 'In Transit', 'Delivered', 'Canceled')),
                           pickup_window_start TEXT, -- ISO 8601 format
                           pickup_window_end TEXT,   -- ISO 8601 format
                           food_category TEXT,
                           estimated_weight_kg REAL,
                           packaging TEXT,
                           handling_notes TEXT,
                           created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (schedule_id) REFERENCES PickupSchedule(id),
                           FOREIGN KEY (supplier_id) REFERENCES Organization(id),
                           FOREIGN KEY (community_id) REFERENCES Organization(id),
                           FOREIGN KEY (logistics_id) REFERENCES Organization(id),
                           FOREIGN KEY (driver_id) REFERENCES Contact(id)
);
CREATE INDEX idx_pickupjob_status ON PickupJob(status);
CREATE INDEX idx_pickupjob_supplier_id ON PickupJob(supplier_id);
CREATE INDEX idx_pickupjob_driver_id ON PickupJob(driver_id);


-------------------------------------------------
-- Table: Suggestion
-- Captures new partner leads submitted by consumers.
-------------------------------------------------
CREATE TABLE Suggestion (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            submitter_id INTEGER NOT NULL,
                            converted_organization_id INTEGER, -- The organization created from this suggestion
                            type TEXT NOT NULL CHECK(type IN ('supplier', 'community', 'logistics')),
                            name TEXT NOT NULL,
                            address TEXT,
                            qualification_status TEXT NOT NULL DEFAULT 'New' CHECK(qualification_status IN ('New', 'Contacted', 'Qualified', 'Rejected')),
                            submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (submitter_id) REFERENCES Contact(id),
                            FOREIGN KEY (converted_organization_id) REFERENCES Organization(id)
);
CREATE INDEX idx_suggestion_submitter_id ON Suggestion(submitter_id);


-------------------------------------------------
-- Triggers for automatically updating the 'updated_at' timestamp
-------------------------------------------------
CREATE TRIGGER update_organization_updated_at
    AFTER UPDATE ON Organization
    FOR EACH ROW
BEGIN
    UPDATE Organization SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_contact_updated_at
    AFTER UPDATE ON Contact
    FOR EACH ROW
BEGIN
    UPDATE Contact SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_pickupschedule_updated_at
    AFTER UPDATE ON PickupSchedule
    FOR EACH ROW
BEGIN
    UPDATE PickupSchedule SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_pickupjob_updated_at
    AFTER UPDATE ON PickupJob
    FOR EACH ROW
BEGIN
    UPDATE PickupJob SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;