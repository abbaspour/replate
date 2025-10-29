# M2M update and search/read users
resource "auth0_client" "m2m_client_update_read_users" {
  name     = "m2m client with users read, update"
  app_type = "non_interactive"
  grant_types = [
    "client_credentials"
  ]
}

data "auth0_client" "m2m_client_update_read_users" {
  name      = auth0_client.m2m_client_update_read_users.name
  client_id = auth0_client.m2m_client_update_read_users.client_id
}

resource "auth0_client_grant" "m2m_client_update_read_users_scopes" {
  client_id    = auth0_client.m2m_client_update_read_users.client_id
  audience     = data.auth0_resource_server.api_v2.identifier
  scopes       = ["update:users", "read:users"]
  subject_type = "client"
}

# Build Auth0 Actions (TypeScript -> dist/*.js) before using them
resource "null_resource" "build_auth0_actions" {
  # Re-run when sources change
  triggers = {
    makefile_hash        = filesha1("${path.module}/../auth0/actions/Makefile")
    pkg_hash             = filesha1("${path.module}/../auth0/actions/package.json")
    tsconfig_hash        = filesha1("${path.module}/../auth0/actions/tsconfig.json")
    sal_acntlink_ts_hash = filesha1("${path.module}/../auth0/actions/silent-account-linking.ts")
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../auth0/actions && npm run build"

  }
}

resource "auth0_action" "silent_account_linking" {
  name    = "Silent Account Linking"
  runtime = "node22"
  deploy  = true
  # Ensure dist file is built before reading
  depends_on = [null_resource.build_auth0_actions]
  code       = file("${path.module}/../auth0/actions/dist/silent-account-linking.js")

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

resource "auth0_trigger_actions" "post_login_binding" {
  trigger = "post-login"

  actions {
    id           = auth0_action.silent_account_linking.id
    display_name = "Silent Account Linking"
  }
}

## LinkedIn social
resource "auth0_connection" "linkedin" {
  name     = "linkedin"
  strategy = "linkedin"

  options {
    client_id                = var.linkedin_client_id
    client_secret            = var.linkedin_client_secret
    strategy_version         = 3
    scopes                   = ["email", "profile"]
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection_clients" "linkedin-clients" {
  connection_id = auth0_connection.linkedin.id
  enabled_clients = [
    auth0_client.donor.client_id,
  ]
}

## Google Social
data "auth0_connection" "google-oauth2" {
  name = "google-oauth2"
}


resource "auth0_connection_clients" "google-clients" {
  connection_id = data.auth0_connection.google-oauth2.id
  enabled_clients = [
    //auth0_client.donor.client_id,
  ]
}

## Facebook social
resource "auth0_connection" "facebook" {
  name     = "facebook"
  strategy = "facebook"

  options {
    client_id = var.facebook_client_id
    client_secret = var.facebook_client_secret
    scopes                   = ["email", "public_profile"]
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection_clients" "facebook-clients" {
  connection_id = auth0_connection.facebook.id
  enabled_clients = [
    auth0_client.donor.client_id,
  ]
}
