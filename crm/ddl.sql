-- Replate Project DDL for Cloudflare D1 (SQLite)
-- Generated on: 2025-09-03

-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS PickupJobs;
DROP TABLE IF EXISTS PickupSchedules;


-------------------------------------------------
-- Table: PickupSchedules
-- Defines the recurring pickup arrangements (standing orders).
-------------------------------------------------
CREATE TABLE PickupSchedules (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                supplier_auth0_org_id TEXT NOT NULL,
                                default_community_auth0_org_id TEXT,
                                is_active INTEGER NOT NULL DEFAULT 1, -- Boolean
                                cron_expression TEXT NOT NULL,
                                pickup_time_of_day TEXT NOT NULL, -- Format 'HH:MM:SS'
                                pickup_duration_minutes INTEGER NOT NULL,
                                default_food_category TEXT, -- Stored as a JSON array string
                                default_estimated_weight_kg REAL,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pickupschedules_supplier_auth0_org_id ON PickupSchedules(supplier_auth0_org_id);


-------------------------------------------------
-- Table: PickupJobs
-- Table: PickupJobs
-- Tracks the lifecycle of a single, concrete pickup event.
-------------------------------------------------
CREATE TABLE PickupJobs (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           schedule_id INTEGER, -- Nullable for ad-hoc jobs
                           supplier_auth0_org_id TEXT NOT NULL,
                           community_auth0_org_id TEXT,
                           logistics_auth0_org_id TEXT,
                           driver_auth0_user_id TEXT,
                           status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Triage', 'Logistics Assigned', 'In Transit', 'Delivered', 'Canceled')),
                           pickup_window_start TEXT, -- ISO 8601 format
                           pickup_window_end TEXT,   -- ISO 8601 format
                           food_category TEXT,
                           estimated_weight_kg REAL,
                           packaging TEXT,
                           handling_notes TEXT,
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (schedule_id) REFERENCES PickupSchedules(id)
);
CREATE INDEX idx_pickupjobs_status ON PickupJobs(status);
CREATE INDEX idx_pickupjobs_supplier_auth0_org_id ON PickupJobs(supplier_auth0_org_id);
CREATE INDEX idx_pickupjobs_driver_auth0_user_id ON PickupJobs(driver_auth0_user_id);


-------------------------------------------------
-- Triggers for automatically updating the 'updated_at' timestamp
-------------------------------------------------
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

