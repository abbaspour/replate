-- Sample data for Replate CRM database
-- Generated on: 2025-09-04

-- Sample Organizations
INSERT INTO Organizations (auth0_org_id, org_type, name, domain, sso_status, pickup_address, delivery_address, coverage_regions, vehicle_types) VALUES
('org_supplier_001', 'supplier', 'Green Grocer Market', 'greengrocer.com', 'active', '123 Market St, San Francisco, CA 94102', NULL, '["San Francisco", "Oakland"]', NULL),
('org_supplier_002', 'supplier', 'Whole Foods Downtown', 'wholefoodsdowntown.com', 'configured', '456 Union St, San Francisco, CA 94108', NULL, '["San Francisco"]', NULL),
('org_community_001', 'community', 'SF Food Bank', 'sffoodbank.org', 'active', NULL, '789 Mission St, San Francisco, CA 94103', '["San Francisco", "Daly City"]', NULL),
('org_community_002', 'community', 'Oakland Community Kitchen', 'oaklandkitchen.org', 'invited', NULL, '321 Broadway, Oakland, CA 94607', '["Oakland", "Berkeley"]', NULL),
('org_logistics_001', 'logistics', 'City Delivery Co', 'citydelivery.com', 'active', '555 Logistics Way, San Mateo, CA 94401', '555 Logistics Way, San Mateo, CA 94401', '["San Francisco", "Oakland", "San Mateo"]', '["van", "truck"]'),
('org_logistics_002', 'logistics', 'Bay Area Transport', 'bayareatransport.com', 'configured', '777 Fleet St, Fremont, CA 94538', '777 Fleet St, Fremont, CA 94538', '["Oakland", "Fremont", "San Jose"]', '["van", "truck", "refrigerated"]');

-- Sample Users
INSERT INTO Users (auth0_user_id, organization_id, email, email_verified, name, picture, donor, org_role, org_status, consumer_lifecycle_stage) VALUES
-- Supplier contacts
('auth0|supplier_admin_001', 1, 'manager@greengrocer.com', 1, 'Sarah Johnson', 'https://example.com/sarah.jpg', 0, 'admin', 'active', 'registered'),
('auth0|supplier_member_001', 1, 'staff@greengrocer.com', 1, 'Mike Chen', 'https://example.com/mike.jpg', 0, 'member', 'active', 'registered'),
('auth0|supplier_admin_002', 2, 'admin@wholefoodsdowntown.com', 1, 'Lisa Rodriguez', 'https://example.com/lisa.jpg', 0, 'admin', 'active', 'registered'),

-- Community contacts
('auth0|community_admin_001', 3, 'director@sffoodbank.org', 1, 'James Wilson', 'https://example.com/james.jpg', 0, 'admin', 'active', 'registered'),
('auth0|community_member_001', 3, 'volunteer@sffoodbank.org', 1, 'Maria Garcia', 'https://example.com/maria.jpg', 0, 'member', 'active', 'registered'),
('auth0|community_admin_002', 4, 'chef@oaklandkitchen.org', 1, 'David Kim', 'https://example.com/david.jpg', 0, 'admin', 'invited', 'registered'),

-- Logistics contacts
('auth0|logistics_admin_001', 5, 'dispatch@citydelivery.com', 1, 'Amanda Thompson', 'https://example.com/amanda.jpg', 0, 'admin', 'active', 'registered'),
('auth0|logistics_driver_001', 5, 'driver1@citydelivery.com', 1, 'Carlos Martinez', 'https://example.com/carlos.jpg', 0, 'driver', 'active', 'registered'),
('auth0|logistics_driver_002', 5, 'driver2@citydelivery.com', 1, 'Jennifer Lee', 'https://example.com/jennifer.jpg', 0, 'driver', 'active', 'registered'),
('auth0|logistics_admin_002', 6, 'ops@bayareatransport.com', 1, 'Robert Davis', 'https://example.com/robert.jpg', 0, 'admin', 'active', 'registered'),

-- Consumer contacts (donors)
('auth0|consumer_001', NULL, 'john.doe@email.com', 1, 'John Doe', 'https://example.com/john.jpg', 1, NULL, NULL, 'donor_repeat'),
('auth0|consumer_002', NULL, 'jane.smith@email.com', 1, 'Jane Smith', 'https://example.com/jane.jpg', 1, NULL, NULL, 'donor_first_time'),
('auth0|consumer_003', NULL, 'alex.brown@email.com', 1, 'Alex Brown', 'https://example.com/alex.jpg', 1, NULL, NULL, 'advocate'),
('auth0|consumer_004', NULL, 'emma.wilson@email.com', 1, 'Emma Wilson', 'https://example.com/emma.jpg', 0, NULL, NULL, 'registered'),
('auth0|consumer_005', NULL, 'michael.jones@email.com', 1, 'Michael Jones', 'https://example.com/michael.jpg', 1, NULL, NULL, 'donor_repeat');

-- Sample Donations
INSERT INTO Donations (user_id, amount, currency, status, testimonial) VALUES
(11, 25.00, 'USD', 'succeeded', 'Happy to support food rescue efforts in our community!'),
(12, 50.00, 'USD', 'succeeded', 'Great cause, keep up the excellent work.'),
(11, 30.00, 'USD', 'succeeded', NULL),
(13, 100.00, 'USD', 'succeeded', 'Amazing organization making a real difference!'),
(15, 15.00, 'USD', 'succeeded', NULL),
(12, 75.00, 'USD', 'pending', NULL),
(13, 200.00, 'USD', 'succeeded', 'Proud to be part of reducing food waste while helping those in need.');

-- Sample Pickup Schedules
INSERT INTO PickupSchedules (supplier_id, default_community_id, is_active, cron_expression, pickup_time_of_day, pickup_duration_minutes, default_food_category, default_estimated_weight_kg) VALUES
(1, 3, 1, '0 18 * * 1,3,5', '18:00:00', 30, '["produce", "bakery"]', 25.5),
(2, 3, 1, '0 19 * * 2,4,6', '19:00:00', 45, '["dairy", "prepared_foods"]', 40.0),
(1, 4, 1, '0 17 * * 7', '17:00:00', 30, '["produce"]', 15.0);

-- Sample Pickup Jobs
INSERT INTO PickupJobs (schedule_id, supplier_id, community_id, logistics_id, driver_id, status, pickup_window_start, pickup_window_end, food_category, estimated_weight_kg, packaging, handling_notes) VALUES
(1, 1, 3, 5, 8, 'Delivered', '2025-09-02T18:00:00Z', '2025-09-02T18:30:00Z', '["produce", "bakery"]', 28.3, 'Cardboard boxes and plastic crates', 'Handle produce gently, some items near expiration'),
(2, 2, 3, 5, 9, 'In Transit', '2025-09-04T19:00:00Z', '2025-09-04T19:45:00Z', '["dairy", "prepared_foods"]', 42.1, 'Insulated bags and containers', 'Keep dairy items refrigerated'),
(1, 1, 3, 5, 8, 'Logistics Assigned', '2025-09-06T18:00:00Z', '2025-09-06T18:30:00Z', '["produce", "bakery"]', 25.0, 'Standard boxes', NULL),
(NULL, 2, 4, 6, NULL, 'New', '2025-09-05T16:00:00Z', '2025-09-05T17:00:00Z', '["prepared_foods"]', 20.0, 'Hot food containers', 'Ad-hoc pickup for surplus prepared meals');

-- Sample Suggestions
INSERT INTO Suggestions (submitter_id, converted_organization_id, type, name, address, qualification_status) VALUES
(11, NULL, 'supplier', 'Corner Deli & Market', '234 Castro St, San Francisco, CA', 'Contacted'),
(13, NULL, 'community', 'Mission District Food Pantry', '567 Mission St, San Francisco, CA', 'New'),
(12, NULL, 'logistics', 'Green Transport Solutions', '890 Eco Way, Berkeley, CA', 'Qualified'),
(15, NULL, 'supplier', 'Farmers Market Collective', '123 Farm Road, Half Moon Bay, CA', 'New'),
(11, NULL, 'community', 'Senior Center Meals Program', '456 Elder Ave, Daly City, CA', 'Rejected');