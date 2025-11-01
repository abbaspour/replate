# business SPA client
resource "auth0_client" "business" {
  name            = "Business SPA"
  description     = "Business SPA client"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://business.${var.top_level_domain}",
    "http://localhost:8787"
  ]

  allowed_logout_urls = [
    "https://business.${var.top_level_domain}",
    "http://localhost:8787"
  ]

  web_origins = [
    "https://business.${var.top_level_domain}",
    "http://localhost:8787"
  ]

  jwt_configuration {
    alg = "RS256"
  }

  organization_usage = "require"

  organization_require_behavior = "post_login_prompt"
}

# Generate auth config file for business SPA
resource "local_file" "business_auth_config_json" {
  filename = "${path.module}/../business/spa/public/auth_config.json"
  content  = <<-EOT
{
  "domain": "${local.auth0_custom_domain}",
  "clientId": "${auth0_client.business.client_id}",
  "audience": "${auth0_resource_server.business_api.identifier}"
}
EOT
  #"redirectUri": "http://localhost:8787"
  #"redirectUri": "https://business.${var.top_level_domain}"
}


# Auth0 resource server for business API
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/apis/68c240fb3efe380648c9ea70/settings
resource "auth0_resource_server" "business_api" {
  name       = "Business API"
  identifier = "business.api"
  
  # Token settings
  token_lifetime                                  = 86400  # 24 hours
  skip_consent_for_verifiable_first_party_clients = true
  
  # JWT settings
  signing_alg = "RS256"
  
  allow_offline_access = false

  enforce_policies = true
  token_dialect = "access_token_authz"
}

# Define scopes for business API
resource "auth0_resource_server_scopes" business-api-scopes {
  resource_server_identifier = auth0_resource_server.business_api.identifier

  // -- pickups --
  scopes {
    name = "read:pickups"
    description = "read:pickups"
  }

  scopes {
    name = "create:pickups"
    description = "create:pickups"
  }

  scopes {
    name = "update:pickups"
    description = "update:pickups"
  }

  // -- schedules --
  scopes {
    name = "read:schedules"
    description = "read:schedules"
  }

  scopes {
    name = "update:schedules"
    description = "update:schedules"
  }

  // -- organization --
  scopes {
    name = "read:organization"
    description = "read:organization"
  }

  scopes {
    name = "update:organization"
    description = "update:organization"
  }
}

// -- Roles
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/roles
resource "auth0_role" "supplier-admin" {
  name = "Supplier Admin"
}

resource "auth0_role" "supplier-member" {
  name = "Supplier Member"
}

resource "auth0_role" "logistics-admin" {
  name = "Logistics Admin"
}

resource "auth0_role" "logistics-driver" {
  name = "Logistics Driver"
}

resource "auth0_role" "community-admin" {
  name = "Community Admin"
}

resource "auth0_role" "community-member" {
  name = "Community Member"
}




# --- Role Permissions for Business API ---
# Using latest syntax per Terraform Auth0 provider (auth0_role_permissions)
# Each block manages the full permission set for the role.

// -- supplier --
resource "auth0_role_permissions" "supplier-admin-perms" {
  role_id = auth0_role.supplier-admin.id

  permissions {
    name                       = "read:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "create:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

resource "auth0_role_permissions" "supplier-member-perms" {
  role_id = auth0_role.supplier-member.id

  permissions {
    name                       = "read:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "create:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

resource "auth0_role_permissions" "logistics-admin-perms" {
  role_id = auth0_role.logistics-admin.id

  permissions {
    name                       = "read:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

resource "auth0_role_permissions" "logistics-driver-perms" {
  role_id = auth0_role.logistics-driver.id

  permissions {
    name                       = "read:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:pickups"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

// -- community --
resource "auth0_role_permissions" "community-admin-perms" {
  role_id = auth0_role.community-admin.id

  permissions {
    name                       = "read:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

resource "auth0_role_permissions" "community-member-perms" {
  role_id = auth0_role.community-member.id

  permissions {
    name                       = "read:organization"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "read:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
  permissions {
    name                       = "update:schedules"
    resource_server_identifier = auth0_resource_server.business_api.identifier
  }
}

// business users DB
resource "auth0_connection" "business-db" {
  name     = "business"
  strategy = "auth0"
}

resource "auth0_connection_clients" "business-db-clients" {
  connection_id = auth0_connection.business-db.id
  enabled_clients = [
    var.auth0_tf_client_id,
    data.auth0_client.default-app.client_id,
    auth0_client.business.client_id
  ]
}

// -- sample db and sample org for supplier --
resource "auth0_organization" "test-supplier-org" {
  name = "acme-supplier"
  display_name = "ACME Supplier"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/D4D0BAQFVEDpTiYC7uA/company-logo_100_100/B4DZde9L2TGUAQ-/0/1749644787666/supplierpay_logo?e=1763596800&v=beta&t=R-N5Y11fjYevt4JFg7CEeSgSlsPc2HAR_Xml-jshytg"
  }
}

resource "auth0_organization_connections" "test-supplier-connections" {
  organization_id = auth0_organization.test-supplier-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-supplier-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@supplier.org"
  password = var.default-password
}

resource "auth0_user" "test-supplier-member" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "member@supplier.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-supplier-members" {
  organization_id = auth0_organization.test-supplier-org.id
  members = [
    auth0_user.test-supplier-admin.id,
    auth0_user.test-supplier-member.id
  ]
}

resource "auth0_organization_member_roles" "test-supplier-admin" {
  depends_on = [
    auth0_organization_members.test-supplier-members
  ]
  organization_id = auth0_organization.test-supplier-org.id
  roles = [
    auth0_role.supplier-admin.id
  ]
  user_id         = auth0_user.test-supplier-admin.id
}

resource "auth0_organization_member_roles" "test-supplier-members" {
  depends_on = [
    auth0_organization_members.test-supplier-members
  ]
  organization_id = auth0_organization.test-supplier-org.id
  roles = [
    auth0_role.supplier-member.id
  ]
  user_id         = auth0_user.test-supplier-member.id
}


// -- sample db and sample org for test community --
resource "auth0_organization" "test-community-org" {
  name = "acme-community"
  display_name = "ACME Community"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/C560BAQHeJjOy9xiXAg/company-logo_200_200/company-logo_200_200/0/1630585785025/community_health_network_logo?e=1763596800&v=beta&t=4E7hgzesvOxL0TMAkcJT8jW1f1MXbHrKxJXouEmv0us"
  }
}

resource "auth0_organization_connections" "test-community-connections" {
  organization_id = auth0_organization.test-community-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-community-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@community.org"
  password = var.default-password
}

resource "auth0_user" "test-community-member" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "member@community.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-community-members" {
  organization_id = auth0_organization.test-community-org.id
  members = [
    auth0_user.test-community-admin.id,
    auth0_user.test-community-member.id
  ]
}

resource "auth0_organization_member_roles" "test-community-admin" {
  depends_on = [
    auth0_organization_members.test-community-members
  ]
  organization_id = auth0_organization.test-community-org.id
  roles = [
    auth0_role.community-admin.id
  ]
  user_id         = auth0_user.test-community-admin.id
}

resource "auth0_organization_member_roles" "test-community-members" {
  depends_on = [
    auth0_organization_members.test-community-members
  ]
  organization_id = auth0_organization.test-community-org.id
  roles = [
    auth0_role.community-member.id
  ]
  user_id         = auth0_user.test-community-member.id
}

// -- sample db and sample org for test logistics --
resource "auth0_organization" "test-logistics-org" {
  name = "acme-logistics"
  display_name = "ACME Logistics"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/C4E0BAQHdZBFG1mvW3A/company-logo_200_200/company-logo_200_200/0/1630618643965/express_logistics_logo?e=1763596800&v=beta&t=Ibv8y78ymX4eYbJ4rzXKAkn8L4XIrq0imtoEeC5rSek"
  }
}

resource "auth0_organization_connections" "test-logistics-connections" {
  organization_id = auth0_organization.test-logistics-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-logistics-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@logistics.org"
  password = var.default-password
}

resource "auth0_user" "test-logistics-driver" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "driver@logistics.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-logistics-members" {
  organization_id = auth0_organization.test-logistics-org.id
  members = [
    auth0_user.test-logistics-admin.id,
    auth0_user.test-logistics-driver.id
  ]
}

resource "auth0_organization_member_roles" "test-logistics-admin" {
  depends_on = [
    auth0_organization_members.test-logistics-members
  ]
  organization_id = auth0_organization.test-logistics-org.id
  roles = [
    auth0_role.logistics-admin.id
  ]
  user_id         = auth0_user.test-logistics-admin.id
}

resource "auth0_organization_member_roles" "test-logistics-drivers" {
  depends_on = [
    auth0_organization_members.test-logistics-members
  ]
  organization_id = auth0_organization.test-logistics-org.id
  roles = [
    auth0_role.logistics-driver.id
  ]
  user_id         = auth0_user.test-logistics-driver.id
}


# Creates a Cloudflare D1 database for CRM data. A future worker/API will connect to this DB.
resource "cloudflare_d1_database" "business" {
  account_id = var.cloudflare_account_id
  name       = "replate-business"
  primary_location_hint = "apac"
  read_replication = {
    mode = "disabled"
  }
}

output "cloudflare_d1_business_id" {
  description = "ID of the Cloudflare D1 business database"
  value       = cloudflare_d1_database.business.id
}

output "cloudflare_d1_business_name" {
  description = "Name of the Cloudflare D1 business database"
  value       = cloudflare_d1_database.business.name
}

# Generate wrangler.toml file for the CRM directory
resource "local_file" "crm_wrangler_toml" {
  filename = "${path.module}/../business/db/wrangler.toml"
  content  = <<-EOT
# Autogenerated by Terraform
[[d1_databases]]
binding = "DB"
database_name = "${cloudflare_d1_database.business.name}"
database_id = "${cloudflare_d1_database.business.id}"
EOT
}
