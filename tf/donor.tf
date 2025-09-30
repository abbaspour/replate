# Auth0 resource server for donor API
resource "auth0_resource_server" "donor_api" {
  name       = "Donor API"
  identifier = "donor.api"
  
  # Token settings
  token_lifetime                                  = 86400  # 24 hours
  skip_consent_for_verifiable_first_party_clients = true
  
  # JWT settings
  signing_alg = "RS256"
  
  # Allow refresh tokens for better UX
  allow_offline_access = false
}

# Define scopes for donor API
/*
resource "auth0_resource_server_scope" "read_donations" {
  resource_server_identifier = auth0_resource_server.donor_api.identifier
  scope                      = "read:donations"
  description                = "Read donation history"
}

resource "auth0_resource_server_scope" "create_payment_intent" {
  resource_server_identifier = auth0_resource_server.donor_api.identifier
  scope                      = "create:payment_intent"
  description                = "Create payment intent for donations"
}
*/

# donor SPA client
resource "auth0_client" "donor" {
  name            = "Replate Donor"
  description     = "Donor SPA client for donor.replate.dev"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://donor.${var.top_level_domain}"
  ]

  allowed_logout_urls = [
    "https://donor.${var.top_level_domain}"
  ]

  allowed_origins = [
    "https://donor.${var.top_level_domain}"
  ]

  web_origins = [
    "https://donor.${var.top_level_domain}"
  ]

  jwt_configuration {
    alg = "RS256"
  }

  organization_usage = "deny"
}

# donor cli client
resource "auth0_client" "donor-cli" {
  name            = "Donor CLI"
  description     = "Donor CLI client"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://donor.${var.top_level_domain}"
  ]

  allowed_logout_urls = [
    "https://donor.${var.top_level_domain}"
  ]

  jwt_configuration {
    alg = "RS256"
  }

  grant_types = [
    "password",
    "http://auth0.com/oauth/grant-type/password-realm"
  ]

  organization_usage = "deny"
}

# Generate auth config file for donor SPA
resource "local_file" "donor_auth_config_json" {
  filename = "${path.module}/../donor/spa/public/auth_config.json"
  content  = <<-EOT
{
  "domain": "${local.auth0_custom_domain}",
  "clientId": "${auth0_client.donor.client_id}",
  "audience": "${auth0_resource_server.donor_api.identifier}",
  "redirectUri": "https://donor.${var.top_level_domain}"
}
EOT
}

resource "auth0_action" "donor_post_login" {
  name    = "Donor Post Login Action"
  runtime = "node22"
  deploy  = true
  code    = file("${path.module}/../auth0/actions/post-login-action-donor.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }
}

resource "auth0_trigger_action" "donor_post_login_binding" {
  trigger      = "post-login"
  action_id    = auth0_action.donor_post_login.id
  display_name = "Set Donor Claim"
}

# sample users
resource "auth0_user" "user1" {
  connection_name = data.auth0_connection.Username-Password-Authentication.name
  email = "user1@atko.email"
  password = "user1@atko.email"
}
