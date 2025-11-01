-- Drop tables in reverse order of dependency to avoid foreign key constraint errors
DROP TABLE IF EXISTS Suggestions;
DROP TABLE IF EXISTS Donations;
