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
  name            = "Donor Website"
  description     = "Donor SPA client for donor.replate.dev"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://donor.${var.top_level_domain}",
    "http://localhost:8787"
  ]

  allowed_logout_urls = [
    "https://donor.${var.top_level_domain}",
    "http://localhost:8787"
  ]

  /*
  allowed_origins = [
    "https://donor.${var.top_level_domain}"
  ]
  */

  web_origins = [
    "https://donor.${var.top_level_domain}",
    "http://localhost:8787"
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
  content = jsonencode({
    "domain": local.auth0_custom_domain,
    "clientId": auth0_client.donor.client_id,
    "audience": auth0_resource_server.donor_api.identifier,
    "redirectUri": "https://donor.${var.top_level_domain}"
    # "redirectUri": "http://localhost:8787"
  })
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

# Build Auth0 Actions (TypeScript -> dist/*.js) before using them
resource "null_resource" "build_auth0_actions" {
  # Re-run when sources change
  triggers = {
    makefile_hash  = filesha1("${path.module}/../auth0/actions/Makefile")
    pkg_hash       = filesha1("${path.module}/../auth0/actions/package.json")
    tsconfig_hash  = filesha1("${path.module}/../auth0/actions/tsconfig.json")
    sal_ts_hash    = filesha1("${path.module}/../auth0/actions/silent-account-linking.ts")
  }

  provisioner "local-exec" {
    command = "make -C ${path.module}/../auth0/actions"
  }
}

resource "auth0_action" "silent_account_linking" {
  name    = "Silent Account Linking"
  runtime = "node22"
  deploy  = true
  # Ensure dist file is built before reading
  depends_on = [null_resource.build_auth0_actions]
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

resource "auth0_trigger_actions" "donor_post_login_binding" {
  trigger      = "post-login"

  actions {
    id    = auth0_action.donor_post_login.id
    display_name = "Set Donor Claim"
  }

  actions {
    id    = auth0_action.silent_account_linking.id
    display_name = "Silent Account Linking"
  }
}

# sample users
resource "auth0_user" "user1" {
  connection_name = data.auth0_connection.Username-Password-Authentication.name
  email = "user1@atko.email"
  password = "user1@atko.email"
}

## LinkedIn social
resource "auth0_connection" "linkedin" {
  name     = "linkedin"
  strategy = "linkedin"

  options {
    client_id = var.linkedin_client_id
    client_secret = var.linkedin_client_secret
    strategy_version = 3
    scopes = ["email", "profile"]
    set_user_root_attributes = "on_each_login"
  }
}

## Google Social
data "auth0_connection" "google-oauth2" {
  name = "google-oauth2"
}


resource "auth0_connection_clients" "GS-clients" {
  connection_id = data.auth0_connection.google-oauth2.id
  enabled_clients = [
    //auth0_client.donor.client_id,
  ]
}

resource "auth0_connection_clients" "LinkedIn-clients" {
  connection_id = auth0_connection.linkedin.id
  enabled_clients = [
    auth0_client.donor.client_id,
  ]
}

