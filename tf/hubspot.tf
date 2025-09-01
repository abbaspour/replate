locals {
  contacts_props_path  = "/crm/v3/properties/contacts"
  companies_props_path = "/crm/v3/properties/companies"
}

## Contact
# contacts.auth0_user_id (unique)
resource "restapi_object" "contact_prop_auth0_user_id" {
  path         = local.contacts_props_path
  read_path    = "${local.contacts_props_path}/{id}"
  update_path  = "${local.contacts_props_path}/{id}"
  destroy_path = "${local.contacts_props_path}/{id}"

  data = jsonencode({
    name            = "auth0_user_id"
    label           = "Auth0 User ID"
    type            = "string"
    fieldType       = "text"
    groupName       = "contactinformation"
    description     = "Auth0 user_id from CIAM"
    hasUniqueValue  = true
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]

}
# contacts.auth0_org_id (nullable for donors; not unique)
resource "restapi_object" "contact_prop_auth0_org_id" {
  path         = local.contacts_props_path
  read_path    = "${local.contacts_props_path}/{id}"
  update_path  = "${local.contacts_props_path}/{id}"
  destroy_path = "${local.contacts_props_path}/{id}"

  data = jsonencode({
    id              = "auth0_org_id"
    name            = "auth0_org_id"
    label           = "Auth0 Org ID"
    type            = "string"
    fieldType       = "text"
    groupName       = "contactinformation"
    description     = "Organization ID from Auth0 (nullable for donors)"
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
    hasUniqueValue  = true
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]
}

# contacts.org_role (enum)
resource "restapi_object" "contact_prop_org_role" {
  path         = local.contacts_props_path
  read_path    = "${local.contacts_props_path}/{id}"
  update_path  = "${local.contacts_props_path}/{id}"
  destroy_path = "${local.contacts_props_path}/{id}"

  data = jsonencode({
    name        = "org_role"
    label       = "Org Role"
    description = "Organization Role"
    type        = "enumeration"
    fieldType   = "select"
    groupName   = "contactinformation"
    options = [
      { label = "Admin", value = "admin" },
      { label = "Member", value = "member" },
      { label = "Driver", value = "driver" }
    ]
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
    hasUniqueValue  = true
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]

}

## Company
# companies.auth0_org_id (unique)
resource "restapi_object" "company_prop_auth0_org_id" {
  path         = local.companies_props_path
  read_path    = "${local.companies_props_path}/{id}"
  update_path  = "${local.companies_props_path}/{id}"
  destroy_path = "${local.companies_props_path}/{id}"

  data = jsonencode({
    name            = "auth0_org_id"
    label           = "Auth0 Org ID"
    type            = "string"
    fieldType       = "text"
    groupName       = "companyinformation"
    description     = "Organization ID from Auth0"
    hasUniqueValue  = true
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]
}

# companies.org_type (enum)
resource "restapi_object" "company_prop_org_type" {
  path         = local.companies_props_path
  read_path    = "${local.companies_props_path}/{id}"
  update_path  = "${local.companies_props_path}/{id}"
  destroy_path = "${local.companies_props_path}/{id}"

  data = jsonencode({
    name        = "org_type"
    label       = "Organization Type"
    description = "Organization Type"
    type        = "enumeration"
    fieldType   = "select"
    groupName   = "companyinformation"
    options = [
      { label = "Supplier", value = "supplier" },
      { label = "Community", value = "community" },
      { label = "Logistics", value = "logistics" }
    ]
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]

}

# companies.sso_status (enum)
resource "restapi_object" "company_prop_sso_status" {
  path         = local.companies_props_path
  read_path    = "${local.companies_props_path}/{id}"
  update_path  = "${local.companies_props_path}/{id}"
  destroy_path = "${local.companies_props_path}/{id}"

  data = jsonencode({
    name        = "sso_status"
    label       = "SSO Status"
    type        = "enumeration"
    fieldType   = "select"
    groupName   = "companyinformation"
    description = "SSO Status"
    options = [
      { label = "Not started", value = "not_started" },
      { label = "Invited", value = "invited" },
      { label = "Configured", value = "configured" },
      { label = "Active", value = "active" }
    ]
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]
}

# companies.pickup_address (supplier)
resource "restapi_object" "company_prop_pickup_address" {
  path         = local.companies_props_path
  read_path    = "${local.companies_props_path}/{id}"
  update_path  = "${local.companies_props_path}/{id}"
  destroy_path = "${local.companies_props_path}/{id}"

  data = jsonencode({
    name            = "pickup_address"
    label           = "Pickup Address"
    description     = "Pickup Address"
    type            = "string"
    fieldType       = "text"
    groupName       = "companyinformation"
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]

}

# companies.delivery_address (community)
resource "restapi_object" "company_prop_delivery_address" {
  path         = local.companies_props_path
  read_path    = "${local.companies_props_path}/{id}"
  update_path  = "${local.companies_props_path}/{id}"
  destroy_path = "${local.companies_props_path}/{id}"

  data = jsonencode({
    name            = "delivery_address"
    label           = "Delivery Address"
    description     = "Delivery Address"
    type            = "string"
    fieldType       = "text"
    groupName       = "companyinformation"
    archived        = false
    calculated      = false
    dataSensitivity = "non_sensitive"
    hidden          = false
  })

  ignore_changes_to = [
    "createdAt",
    "createdUserId",
    "displayOrder",
    "externalOptions",
    "formField",
    "modificationMetadata",
    "options",
    "updatedAt",
    "updatedUserId",
    "hasUniqueValue",
    "id"
  ]
}

