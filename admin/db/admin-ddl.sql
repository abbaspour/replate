-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS SsoInvitations;
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
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
                       auth0_org_id TEXT,
                       email TEXT NOT NULL,
                       email_verified INTEGER NOT NULL DEFAULT 0, -- Boolean (0=false, 1=true)
                       blocked INTEGER NOT NULL DEFAULT 0, -- Boolean
                       name TEXT,
                       picture TEXT,
                       family_name TEXT,
                       given_name TEXT,
                       nickname TEXT,
                       phone_number TEXT,
                       phone_verified INTEGER NOT NULL DEFAULT 0, -- Boolean
                       user_metadata TEXT,
                       app_metadata TEXT,
                       identities TEXT,
                       --  business fields
                       donor INTEGER NOT NULL DEFAULT 0, -- Boolean
                       org_role TEXT CHECK(org_role IN ('admin', 'member', 'driver')),
                       org_status TEXT CHECK(org_status IN ('invited', 'active', 'suspended')),
                       consumer_lifecycle_stage TEXT DEFAULT 'registered' CHECK(consumer_lifecycle_stage IN ('visitor', 'registered', 'donor_first_time', 'donor_repeat', 'advocate')),
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       last_event_processed TIMESTAMP
);
CREATE INDEX idx_users_auth0_user_id ON Users(auth0_user_id);
CREATE INDEX idx_users_auth0_org_id ON Users(auth0_org_id);


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

-------------------------------------------------
-- Table: SsoInvitations
-- Captures self-service SSO Invitations for an organization
-------------------------------------------------
CREATE TABLE SsoInvitations (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                auth0_org_id TEXT NOT NULL,
                                issuer_auth0_user_id TEXT,
                                display_name TEXT,
                                link TEXT NOT NULL,
                                auth0_ticket_id TEXT,
                                auth0_connection_name TEXT,
                                domain_verification TEXT CHECK(domain_verification IN ('Off','Optional','Required')),
                                accept_idp_init_saml INTEGER NOT NULL DEFAULT 0,
                                ttl INTEGER NOT NULL DEFAULT 432000, -- seconds
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ssoinv_org_id ON SsoInvitations(auth0_org_id);
CREATE INDEX idx_ssoinv_created_at ON SsoInvitations(created_at);
CREATE INDEX idx_ssoinv_issuer_auth0_user_id ON SsoInvitations(issuer_auth0_user_id);