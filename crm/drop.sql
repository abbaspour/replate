-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS SsoInvitations;
DROP TABLE IF EXISTS Suggestions;
DROP TABLE IF EXISTS PickupJobs;
DROP TABLE IF EXISTS PickupSchedules;
DROP TABLE IF EXISTS Donations;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Organizations;
