# Auth0 resource server for donor API
resource "auth0_resource_server" "admin_api" {
  name       = "Admin API"
  identifier = "admin.api"

  # Token settings
  token_lifetime                                  = 86400 # 24 hours
  skip_consent_for_verifiable_first_party_clients = true

  # JWT settings
  signing_alg = "RS256"

  # Allow refresh tokens for better UX
  allow_offline_access = false

  token_dialect = "access_token_authz"
}

resource "auth0_resource_server_scopes" "admin_api_scopes" {
  resource_server_identifier = auth0_resource_server.admin_api.identifier

  scopes {
    name        = "read:organizations"
    description = "read:organizations"
  }
  scopes {
    name        = "update:organizations"
    description = "update:organizations"
  }
  scopes {
    name        = "create:organizations"
    description = "create:organizations"
  }
  scopes {
    name        = "read:sso_invitations"
    description = "read:sso_invitations"
  }
  scopes {
    name        = "create:sso_invitations"
    description = "create:sso_invitations"
  }
  scopes {
    name        = "delete:sso_invitations"
    description = "delete:sso_invitations"
  }
}


resource "auth0_organization" "replate-org" {
  name         = "replate"
  display_name = "Replate"
}

resource "auth0_role" "role-replate-admin" {
  name = "Replate Admin"
}

locals {
  adminApiScopesList = [
    for scope in auth0_resource_server_scopes.admin_api_scopes.scopes : scope.name
  ]
}

resource "auth0_role_permission" "replate-admin_perm" {
  for_each = toset(local.adminApiScopesList)

  role_id                    = auth0_role.role-replate-admin.id
  resource_server_identifier = auth0_resource_server.admin_api.identifier
  permission                 = each.value
}

# Okta workforce federation connection
resource "auth0_connection" "replate_workforce" {
  name     = "replate-workforce"
  strategy = "okta"

  options {
    client_id     = okta_app_oauth.auth0_rwa.client_id
    client_secret = okta_app_oauth.auth0_rwa.client_secret
    domain        = "${var.okta_org_name}.${var.okta_base_url}"

    # OIDC configuration
    #discovery_url = "https://${var.okta_org_name}.${var.okta_base_url}/.well-known/openid-configuration"

    # Scopes
    scopes = ["openid", "profile", "email", "groups"]

    upstream_params = jsonencode({
      "screen_name" : {
        "alias" : "login_hint"
      }
    })

    connection_settings {
      pkce = "auto"
    }

    attribute_map {
      mapping_mode   = "basic_profile"
      userinfo_scope = "openid email profile groups"
      attributes = jsonencode({
        "name" : "$${context.tokenset.name}",
        "email" : "$${context.tokenset.email}",
        "email_verified" : "$${context.tokenset.email_verified}",
        "nickname" : "$${context.tokenset.nickname}",
        "picture" : "$${context.tokenset.picture}",
        "given_name" : "$${context.tokenset.given_name}",
        "family_name" : "$${context.tokenset.family_name}"
      })
    }
    # TODO: Attribute mapping
    /*
    attributes_map = {
      email      = "email"
      name       = "name" 
      given_name = "given_name"
      family_name = "family_name"
      groups     = "groups"
    }
*/
    # Set email as username
    set_user_root_attributes = "on_each_login"
  }
}

# Enable the connection for the Replate organization
resource "auth0_connection_clients" "replate_workforce_clients" {
  connection_id   = auth0_connection.replate_workforce.id
  enabled_clients = [auth0_client.admin_spa.id]
}

# SPA Application for admin interface using Okta authentication
resource "auth0_client" "admin_spa" {
  name                = "Admin SPA"
  app_type            = "spa"
  callbacks           = ["https://admin.${var.top_level_domain}/callback"]
  allowed_logout_urls = ["https://admin.${var.top_level_domain}"]
  allowed_origins     = ["https://admin.${var.top_level_domain}"]
  web_origins         = ["https://admin.${var.top_level_domain}"]

  # JWT configuration
  jwt_configuration {
    alg = "RS256"
  }

  # Grant types for SPA
  grant_types = ["authorization_code"]

  # OIDC conformant
  oidc_conformant = true

  /*
  default_organization {
    organization_id = auth0_organization.replate-org.id
    flows = ["client_credentials"]
  }
  */

  organization_usage = "require"
  organization_require_behavior = "post_login_prompt"
}

# Grant scopes to the admin SPA
resource "auth0_client_grant" "admin_spa_grant" {
  client_id    = auth0_client.admin_spa.id
  audience     = auth0_resource_server.admin_api.identifier
  subject_type = "client"
  scopes = [
    "read:organizations",
    "update:organizations",
    "create:organizations",
    "read:sso_invitations",
    "create:sso_invitations",
    "delete:sso_invitations"
  ]
}

# Organization connection for Replate
resource "auth0_organization_connection" "replate_org-connection" {
  organization_id = auth0_organization.replate-org.id
  connection_id   = auth0_connection.replate_workforce.id

  assign_membership_on_login = true
}

# Generate auth config file for Admin SPA
resource "local_file" "admin_auth_config_json" {
  filename = "${path.module}/../admin/spa/public/auth_config.json"
  content  = <<-EOT
{
  "domain": "${local.auth0_custom_domain}",
  "clientId": "${auth0_client.admin_spa.client_id}",
  "audience": "${auth0_resource_server.admin_api.identifier}",
  "redirectUri": "https://admin.${var.top_level_domain}/callback",
  "organization": "${auth0_organization.replate-org.id}"
}
EOT
}

# M2M client for Admin API to call Auth0 Management API (CRUD Organizations)
resource "auth0_client" "admin_api_m2m" {
  name                = "Admin API Management M2M"
  app_type            = "non_interactive"
  grant_types         = ["client_credentials"]
  oidc_conformant     = true
}
resource "auth0_client_credentials" "admin_api_m2m-credentials" {
  client_id = auth0_client.admin_api_m2m.client_id
  authentication_method = "client_secret_post"
}

# Data source to get the client secret
data "auth0_client" "admin_api_m2m" {
  client_id = auth0_client.admin_api_m2m.client_id
}


# Grant Management API scopes to the M2M client
resource "auth0_client_grant" "admin_api_m2m_mgmt_grant" {
  client_id    = auth0_client.admin_api_m2m.id
  audience     = "https://${var.auth0_domain}/api/v2/"
  subject_type = "client"
  scopes = [
    "read:organizations",
    "create:organizations",
    "update:organizations",
    "delete:organizations",
    "create:sso_access_tickets",
    "delete:sso_access_tickets"
  ]
}

# Create .dev.vars file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
resource "local_file" "admin_api-dot-dev" {
  filename = "${path.module}/../admin/api/.env"
  file_permission = "600"
  content  = <<-EOT
AUTH0_DOMAIN=${var.auth0_domain}
AUTH0_CLIENT_ID=${auth0_client.admin_api_m2m.client_id}
AUTH0_CLIENT_SECRET=${data.auth0_client.admin_api_m2m.client_secret}
SELF_SERVICE_SSO_PROFILE_ID=${auth0_self_service_profile.ss-sso-profile.id}
EOT
}
