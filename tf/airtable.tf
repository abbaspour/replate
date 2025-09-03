# ==============================================================================
# DATA SOURCE & LOCALS: Check for existing tables to make script idempotent
# ==============================================================================

data "http" "existing_tables" {
  url = "https://api.airtable.com/v0/meta/bases/${var.airtable_base_id}/tables"
  request_headers = {
    "Authorization" = "Bearer ${var.airtable_personal_access_token}"
  }
}

locals {
  # Create a map of existing table names to their IDs, e.g., { "Users" = "tblXXXX" }
  existing_tables_map = {
    # Decode the JSON response body from the http data source
    for table in jsondecode(data.http.existing_tables.response_body).tables : table.name => table.id
  }
}


# ==============================================================================
# STEP 1: CREATE TABLES WITH NON-LINKED FIELDS (IF THEY DON'T EXIST)
# ==============================================================================

# ------------------------------------------------------------------------------
# Resource: Companies Table (Conditional Creation)
# ------------------------------------------------------------------------------
resource "restapi_object" "companies_table" {
  count = contains(keys(local.existing_tables_map), "Companies") ? 0 : 1
  path  = "/v0/meta/bases/${var.airtable_base_id}/tables"
  data  = jsonencode({
    name        = "Companies"
    description = "Represents a Supplier, Community, or Logistics organization."
    fields      = [
      { name = "name", type = "singleLineText", description = "Company Name (synced from Auth0)." },
      { name = "auth0_org_id", type = "singleLineText", description = "Unique ID from Auth0 Organization." },
      { name = "domains", type = "richText", description = "Company domains for HRD (synced from Auth0)." },
      {
        name    = "org_type"
        type    = "singleSelect"
        options = { choices = [{ name = "supplier" }, { name = "community" }, { name = "logistics" }] }
      },
      {
        name    = "sso_status"
        type    = "singleSelect"
        options = { choices = [{ name = "not_started" }, { name = "invited" }, { name = "configured" }, { name = "active" }] }
      },
      { name = "pickup_address", type = "richText", description = "For Suppliers" },
      { name = "pickup_schedule", type = "richText", description = "For Suppliers (can be JSON)" },
      { name = "delivery_address", type = "richText", description = "For Communities" },
      { name = "delivery_schedule", type = "richText", description = "For Communities (can be JSON)" },
      { name = "coverage_regions", type = "richText", description = "For Logistics" },
      { name = "vehicle_types", type = "richText", description = "For Logistics" },
    ]
  })
}

# ------------------------------------------------------------------------------
# Resource: Users Table (Conditional Creation)
# ------------------------------------------------------------------------------
resource "restapi_object" "users_table" {
  count = contains(keys(local.existing_tables_map), "Users") ? 0 : 1
  path  = "/v0/meta/bases/${var.airtable_base_id}/tables"
  data  = jsonencode({
    name        = "Users"
    description = "Stores every person who logs into Replate (donors and business users)."
    fields      = [
      { name = "email", type = "email", description = "Primary email of the user (Primary Field)." },
      { name = "auth0_user_id", type = "singleLineText", description = "Unique ID from Auth0 User." },
      { name = "name", type = "singleLineText", description = "User's full name (synced from Auth0)." },
      { name = "picture", type = "url", description = "URL to user's profile picture (synced from Auth0)." },
      {
        name    = "persona"
        type    = "singleSelect"
        options = { choices = [{ name = "donor" }, { name = "supplier_member" }, { name = "supplier_admin" }, { name = "community_member" }, { name = "community_admin" }, { name = "driver" }, { name = "logistics_admin" }, { name = "replate_admin" }] }
      },
      {
        name    = "org_role"
        type    = "singleSelect"
        options = { choices = [{ name = "admin" }, { name = "member" }, { name = "driver" }] }
      },
      {
        name    = "org_status"
        type    = "singleSelect"
        options = { choices = [{ name = "invited" }, { name = "active" }, { name = "suspended" }] }
      },
      { name = "sso_enrolled", type = "checkbox", options = { icon = "dot", color = "greenBright" } },
      { name = "sso_provider", type = "singleLineText" },
      {
        name    = "consumer_lifecycle_stage"
        type    = "singleSelect"
        options = { choices = [{ name = "visitor" }, { name = "registered" }, { name = "donor_first_time" }, { name = "donor_repeat" }, { name = "advocate" }] }
      },
      { name = "stripe_customer_id", type = "singleLineText" },
    ]
  })
}

# ------------------------------------------------------------------------------
# Resource: Donations Table (Conditional Creation)
# ------------------------------------------------------------------------------
resource "restapi_object" "donations_table" {
  count = contains(keys(local.existing_tables_map), "Donations") ? 0 : 1
  path  = "/v0/meta/bases/${var.airtable_base_id}/tables"
  data  = jsonencode({
    name        = "Donations"
    description = "Tracks all monetary donations from consumer users (Donors)."
    fields      = [
      { name = "amount", type = "currency", options = { precision = 2, symbol = "$" } },
      { name = "currency", type = "singleLineText" },
      {
        name    = "status"
        type    = "singleSelect"
        options = { choices = [{ name = "succeeded" }, { name = "pending" }, { name = "failed" }] }
      },
      { name = "testimonial", type = "richText" },
      { name = "stripe_payment_intent_id", type = "singleLineText" },
    ]
  })
}

# ------------------------------------------------------------------------------
# Resource: Pickup Requests Table (Conditional Creation)
# ------------------------------------------------------------------------------
resource "restapi_object" "pickup_requests_table" {
  count = contains(keys(local.existing_tables_map), "Pickup Requests") ? 0 : 1
  path  = "/v0/meta/bases/${var.airtable_base_id}/tables"
  data  = jsonencode({
    name        = "Pickup Requests"
    description = "Tracks the lifecycle of a food pickup request."
    fields      = [
      { name = "name", type = "singleLineText", description = "Primary descriptor for the pickup request (Primary Field)." },
      {
        name    = "type"
        type    = "singleSelect"
        options = { choices = [{ name = "scheduled" }, { name = "ad_hoc" }] }
      },
      {
        name    = "status"
        type    = "singleSelect"
        options = { choices = [{ name = "New", color = "blueLight2" }, { name = "Triage", color = "yellowLight2" }, { name = "Logistics Assigned", color = "purpleLight2" }, { name = "In Transit", color = "cyanLight2" }, { name = "Delivered", color = "greenLight2" }, { name = "Canceled", color = "redLight2" }] }
      },
      { name = "ready_at", type = "dateTime", options = { dateFormat = { name = "local" }, timeFormat = { name = "12hour" }, timeZone = "client" } },
      { name = "pickup_window_start", type = "dateTime", options = { dateFormat = { name = "local" }, timeFormat = { name = "12hour" }, timeZone = "client" } },
      { name = "pickup_window_end", type = "dateTime", options = { dateFormat = { name = "local" }, timeFormat = { name = "12hour" }, timeZone = "client" } },
      { name = "food_category", type = "richText" },
      { name = "estimated_weight_kg", type = "number", options = { precision = 1 } },
      { name = "packaging", type = "richText" },
      { name = "handling_notes", type = "richText" },
    ]
  })
}

# ------------------------------------------------------------------------------
# Resource: Suggestions Table (Conditional Creation)
# ------------------------------------------------------------------------------
resource "restapi_object" "suggestions_table" {
  count = contains(keys(local.existing_tables_map), "Suggestions") ? 0 : 1
  path  = "/v0/meta/bases/${var.airtable_base_id}/tables"
  data  = jsonencode({
    name        = "Suggestions"
    description = "Captures new leads for potential partners, submitted by consumers."
    fields      = [
      { name = "name", type = "singleLineText" },
      {
        name    = "type"
        type    = "singleSelect"
        options = { choices = [{ name = "supplier" }, { name = "community" }, { name = "logistics" }] }
      },
      { name = "address", type = "richText" },
      {
        name    = "qualification_status"
        type    = "singleSelect"
        options = { choices = [{ name = "New" }, { name = "Contacted" }, { name = "Qualified" }, { name = "Rejected" }] }
      },
    ]
  })
}

# ------------------------------------------------------------------------------
# LOCALS: Determine table IDs, whether from existing data or new resources
# ------------------------------------------------------------------------------
locals {
  companies_table_id       = try(local.existing_tables_map["Companies"], restapi_object.companies_table[0].id)
  users_table_id           = try(local.existing_tables_map["Users"], restapi_object.users_table[0].id)
  donations_table_id       = try(local.existing_tables_map["Donations"], restapi_object.donations_table[0].id)
  pickup_requests_table_id = try(local.existing_tables_map["Pickup Requests"], restapi_object.pickup_requests_table[0].id)
  suggestions_table_id     = try(local.existing_tables_map["Suggestions"], restapi_object.suggestions_table[0].id)
}


# ==============================================================================
# STEP 2: CREATE LINKED RECORD FIELDS BETWEEN TABLES
# ==============================================================================

# ------------------------------------------------------------------------------
# Link: Users <--> Companies (1:N)
# ------------------------------------------------------------------------------
resource "restapi_object" "link_user_to_company" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.users_table_id}/fields"
  data = jsonencode({
    name    = "Company"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.companies_table_id
      # inverseLinkFieldName can be set via UI; Airtable API does not accept prefersSingleRecordLink/isReversed on create
    }
  })
}

# ------------------------------------------------------------------------------
# Link: Donations --> Users (1:N)
# ------------------------------------------------------------------------------
resource "restapi_object" "link_donation_to_user" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.donations_table_id}/fields"
  data = jsonencode({
    name    = "Donor"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.users_table_id
      # inverseLinkFieldName can be set via UI
    }
  })
}

# ------------------------------------------------------------------------------
# Links: Pickup Requests --> Other Tables
# ------------------------------------------------------------------------------
resource "restapi_object" "link_pickup_to_supplier" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.pickup_requests_table_id}/fields"
  data = jsonencode({
    name    = "Supplier"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.companies_table_id
    }
  })
}

resource "restapi_object" "link_pickup_to_community" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.pickup_requests_table_id}/fields"
  data = jsonencode({
    name    = "Community"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.companies_table_id
    }
  })
}

resource "restapi_object" "link_pickup_to_logistics" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.pickup_requests_table_id}/fields"
  data = jsonencode({
    name    = "Logistics"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.companies_table_id
    }
  })
}

resource "restapi_object" "link_pickup_to_driver" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.pickup_requests_table_id}/fields"
  data = jsonencode({
    name    = "Driver"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.users_table_id
    }
  })
}

# ------------------------------------------------------------------------------
# Links: Suggestions --> Other Tables
# ------------------------------------------------------------------------------
resource "restapi_object" "link_suggestion_to_user" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.suggestions_table_id}/fields"
  data = jsonencode({
    name    = "Submitter"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.users_table_id
    }
  })
}

resource "restapi_object" "link_suggestion_to_company" {
  path = "/v0/meta/bases/${var.airtable_base_id}/tables/${local.suggestions_table_id}/fields"
  data = jsonencode({
    name    = "Converted Company"
    type    = "multipleRecordLinks"
    options = {
      linkedTableId = local.companies_table_id
    }
  })
}

