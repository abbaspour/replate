DROP TABLE IF EXISTS Suggestions;
DROP TABLE IF EXISTS Donations;

-------------------------------------------------
-- Table: Suggestions
-- Captures new partner leads submitted by consumers.
-------------------------------------------------
CREATE TABLE Suggestions (
                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                             submitter_auth0_user_id TEXT NOT NULL,
                             converted_auth0_org_id TEXT, -- The organization created from this suggestion
                             type TEXT NOT NULL CHECK(type IN ('supplier', 'community', 'logistics')),
                             name TEXT NOT NULL,
                             address TEXT,
                             qualification_status TEXT NOT NULL DEFAULT 'New' CHECK(qualification_status IN ('New', 'Contacted', 'Qualified', 'Rejected')),
                             submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_suggestions_submitter_auth0_user_id ON Suggestions(submitter_auth0_user_id);
CREATE INDEX idx_suggestions_converted_auth0_org_id ON Suggestions(converted_auth0_org_id);


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
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_donations_auth0_user_id ON Donations(auth0_user_id);

