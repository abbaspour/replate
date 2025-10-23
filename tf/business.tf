# Auth0 resource server for donor API
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

# Define scopes for donor API

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

# donor SPA client
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

# Generate auth config file for donor SPA
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

// -- Roles
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
    name                       = "update:pickups"
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
