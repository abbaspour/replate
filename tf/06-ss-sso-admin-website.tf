# IPv4 - A
resource "cloudflare_dns_record" "admin" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "admin"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

# IPv6 - AAAA
resource "cloudflare_dns_record" "adminV6" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "admin"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

# VISIT https://manage.auth0.com/dashboard/au/amin-saml-idp/applications/zZo9ytfBcus9tBmYBZGvTS0sLO07GT4a/settings
resource "auth0_self_service_profile" "ss-sso-profile" {
  name = "Replate Self-Service Single Sign On Onboarding"
  branding {
    logo_url = "https://donor.replate.dev/images/logo.png"
  }
  allowed_strategies = [
    "adfs",
    "google-apps",
    "keycloak-samlp",
    "oidc",
    "okta",
    "pingfederate",
    "samlp",
    "waad",
  ]
}

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
  // -- users --
  scopes {
    name        = "read:users"
    description = "read:users"
  }
  scopes {
    name        = "create:users"
    description = "create:users"
  }
  scopes {
    name        = "update:users"
    description = "update:users"
  }
  scopes {
    name        = "delete:users"
    description = "delete:users"
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
    domain        = "${var.okta_admin_org_name}.${var.okta_admin_base_url}"

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

resource "random_string" "event-api-token" {
  length = 64
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
BUSINESS_SPA_CLIENT_ID=${auth0_client.business.client_id}
EVENTS_API_TOKEN=${random_string.event-api-token.result}
EOT
}

## database
# Creates a Cloudflare D1 database for CRM data. A future worker/API will connect to this DB.
resource "cloudflare_d1_database" "admin" {
  account_id = var.cloudflare_account_id
  name       = "replate-admin"
  primary_location_hint = "apac"
  read_replication = {
    mode = "disabled"
  }
}

output "cloudflare_d1_admin_id" {
  description = "ID of the Cloudflare D1 Admin database"
  value       = cloudflare_d1_database.admin.id
}

output "cloudflare_d1_admin_name" {
  description = "Name of the Cloudflare D1 Admin database"
  value       = cloudflare_d1_database.admin.name
}


# Generate wrangler.toml file for the admin db
resource "local_file" "admin-db_wrangler_toml" {
  filename = "${path.module}/../admin/db/wrangler.toml"
  content  = <<-EOT
# Autogenerated by Terraform
[[d1_databases]]
binding = "DB"
database_name = "${cloudflare_d1_database.admin.name}"
database_id = "${cloudflare_d1_database.admin.id}"
EOT
}

# Sample org for SS-SSO federated
resource "auth0_organization" "ss-fed-community-org" {
  name = "ss-fed-community"
  display_name = "Self-service Federated Community"
}

output "ss-fed-community-org" {
  value = auth0_organization.ss-fed-community-org.id
}
