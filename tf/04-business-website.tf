# VISIT https://business.replate.dev/organization
# IPv4 - A
resource "cloudflare_dns_record" "business" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "business"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

# IPv6 - AAAA
resource "cloudflare_dns_record" "businessV6" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "business"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

# business SPA client
resource "auth0_client" "business" {
  name            = "Business SPA"
  description     = "Business SPA client"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://business.${var.top_level_domain}",
  ]

  allowed_logout_urls = [
    "https://business.${var.top_level_domain}",
  ]

  web_origins = [
    "https://business.${var.top_level_domain}",
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
  token_lifetime                                  = 86400 # 24 hours
  skip_consent_for_verifiable_first_party_clients = true

  # JWT settings
  signing_alg = "RS256"

  allow_offline_access = false

  enforce_policies = true
  token_dialect    = "access_token_authz"
}

# Define scopes for business API
resource "auth0_resource_server_scopes" "business-api-scopes" {
  resource_server_identifier = auth0_resource_server.business_api.identifier

  // -- pickups --
  scopes {
    name        = "read:pickups"
    description = "read:pickups"
  }

  scopes {
    name        = "create:pickups"
    description = "create:pickups"
  }

  scopes {
    name        = "update:pickups"
    description = "update:pickups"
  }

  // -- schedules --
  scopes {
    name        = "read:schedules"
    description = "read:schedules"
  }

  scopes {
    name        = "update:schedules"
    description = "update:schedules"
  }

  // -- organization --
  scopes {
    name        = "read:organization"
    description = "read:organization"
  }

  scopes {
    name        = "update:organization"
    description = "update:organization"
  }
}

data "auth0_resource_server" "my-org" {
  identifier = "https://${var.auth0_domain}/my-org/"
}

resource "auth0_client_grant" "business-my-org-grant" {
  audience           = data.auth0_resource_server.my-org.identifier
  client_id          = auth0_client.business.client_id
  organization_usage = "require"
  scopes = [
    "read:my_org:details",
    "update:my_org:details",
    "create:my_org:identity_providers",
    "read:my_org:identity_providers",
    "update:my_org:identity_providers",
    "delete:my_org:identity_providers",
    "update:my_org:identity_providers_detach",
    "read:my_org:identity_providers_domains",
    "create:my_org:identity_provider_domains",
    "delete:my_org:identity_provider_domains",
    "read:my_org:domains",
    "delete:my_org:domains",
    "create:my_org:domains",
    "update:my_org:domains",
    "read:my_org:scim_tokens",
    "create:my_org:scim_tokens",
    "delete:my_org:scim_tokens",
    "create:my_org:identity_provider_provisioning",
    "read:my_org:identity_provider_provisioning",
    "delete:my_org:identity_provider_provisioning",
    "read:my_org:configuration"
  ]
  subject_type = "user"
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

  // business api
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers_detach"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:configuration"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
}

resource "auth0_role_permissions" "supplier-member-perms" {
  role_id = auth0_role.supplier-member.id

  // business api
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:configuration"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
}

resource "auth0_role_permissions" "logistics-admin-perms" {
  role_id = auth0_role.logistics-admin.id

  // business api
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers_detach"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:configuration"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
}

// -- community --
resource "auth0_role_permissions" "community-admin-perms" {
  role_id = auth0_role.community-admin.id

  // business api
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:identity_providers_detach"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "update:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "create:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "delete:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:configuration"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
}

resource "auth0_role_permissions" "community-member-perms" {
  role_id = auth0_role.community-member.id

  // business api
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

  // my org api
  permissions {
    name                       = "read:my_org:details"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_providers_domains"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:scim_tokens"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:identity_provider_provisioning"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
  permissions {
    name                       = "read:my_org:configuration"
    resource_server_identifier = data.auth0_resource_server.my-org.identifier
  }
}

// business users DB
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/connections/database/con_X7MndTpJM6XpxjIJ/settings
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

# Creates a Cloudflare D1 database for CRM data. A future worker/API will connect to this DB.
resource "cloudflare_d1_database" "business" {
  account_id            = var.cloudflare_account_id
  name                  = "replate-business"
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

output "business-client_id" {
  value = auth0_client.business.client_id
}
