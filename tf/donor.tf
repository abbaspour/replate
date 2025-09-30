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

# M2M update and search/read users
resource "auth0_client" "m2m_client_update_read_users" {
  name  = "m2m client with users read, update"
  app_type = "non_interactive"
  grant_types = [
    "client_credentials"
  ]
}

data "auth0_client" "m2m_client_update_read_users" {
  name = auth0_client.m2m_client_update_read_users.name
  client_id = auth0_client.m2m_client_update_read_users.client_id
}

resource "auth0_client_grant" "m2m_client_update_read_users_scopes" {
  client_id = auth0_client.m2m_client_update_read_users.client_id
  audience = data.auth0_resource_server.api_v2.identifier
  scopes = ["update:users", "read:users"]
  subject_type = "client"
}

resource "auth0_action" "silent_account_linking" {
  name    = "Silent Account Linking"
  runtime = "node22"
  deploy  = true
  # to build code run
  code    = file("${path.module}/../auth0/actions/dist/silent-account-linking.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  dependencies {
    name    = "auth0"
    version = "4.1.0"
  }

  secrets {
    name  = "clientId"
    value = auth0_client.m2m_client_update_read_users.client_id
  }

  secrets {
    name  = "clientSecret"
    value = data.auth0_client.m2m_client_update_read_users.client_secret
  }

  secrets {
    name  = "domain"
    value = var.auth0_domain
  }
}

/*
resource "auth0_trigger_actions" "silent_linking_trigger" {
  trigger = "post-login"

  actions {
    id           = auth0_action.silent_account_linking.id
    display_name = auth0_action.silent_account_linking.name
  }
}
*/

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
