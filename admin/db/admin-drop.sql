-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS SsoInvitations;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Organizations;