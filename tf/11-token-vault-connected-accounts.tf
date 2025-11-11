# donor cli client
resource "auth0_client" "donor-cli" {
  name            = "Donor CLI"
  description     = "Donor CLI client"
  app_type        = "regular_web"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://donor.${var.top_level_domain}",
    "https://jwt.io"
  ]

  allowed_logout_urls = [
    "https://donor.${var.top_level_domain}"
  ]

  jwt_configuration {
    alg = "RS256"
  }

  grant_types = [
    "implicit",
    "password",
    "http://auth0.com/oauth/grant-type/password-realm",
    "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
    "urn:openid:params:grant-type:ciba",
    "refresh_token"
  ]

  async_approval_notification_channels = [
    "email"
  ]

  organization_usage = "deny"
}

data "auth0_client" "donor-cli" {
  client_id = auth0_client.donor-cli.client_id
}

output "donor-cli-client-id" {
  value = auth0_client.donor-cli.client_id
}


resource "auth0_client_grant" "donor-cli-grants" {
  audience  = data.auth0_resource_server.my-account.identifier
  client_id = auth0_client.donor-cli.id
  scopes = [
    // authentication methods
    "read:me:authentication_methods",
    "delete:me:authentication_methods",
    "update:me:authentication_methods",
    "create:me:authentication_methods",
    // factors
    "read:me:factors",
    // connected_accounts
    "create:me:connected_accounts",
    "read:me:connected_accounts",
    "delete:me:connected_accounts"
  ]
  subject_type = "user"
}

data "auth0_client" "donor-api-client" {
  name = auth0_resource_server.donor_api.name
}

data "auth0_client" "business-api-client" {
  name = auth0_resource_server.business_api.name
}

## social connection to connected accounts
# VISIT https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/21003461-3662-430d-a8af-bc50abacfe6e/isMSAApp~/false
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/connections/social/con_nvtYytFItnYhBirE/settings
resource "auth0_connection" "windowslive" {
  name     = "Microsoft"
  strategy = "windowslive"

  authentication {
    active = false
  }

  connected_accounts {
    active = true
  }

  options {
    client_id                = var.microsoft_client_id
    client_secret            = var.microsoft_client_secret
    strategy_version         = 2
    scopes                   = [
      "signin",
      "offline_access",
      "graph_calendars",
      "graph_user"
    ]
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection_clients" "windowslive-clients" {
  connection_id = auth0_connection.windowslive.id
  enabled_clients = [
    auth0_client.donor-cli.client_id,
    data.auth0_client.donor-api-client.client_id,
    data.auth0_client.business-api-client.client_id
  ]
}

# Create .dev.vars file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
resource "local_file" "donor_api-dot-dev" {
  filename = "${path.module}/../donor/api/.env"
  file_permission = "600"
  content  = <<-EOT
DONOR_API_CLIENT_ID=${data.auth0_client.donor-api-client.client_id}
DONOR_API_CLIENT_SECRET=${data.auth0_client.donor-api-client.client_secret}
#CONNECTED_ACCOUNTS_CONNECTION=${auth0_connection.windowslive.name}
EOT
}

# Create .dev.vars file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
# VISIT cd ../agent/oidc-bash && ./export-myaccount-at.sh
# VISIT cd ../agent/auth0-myaccount-bash/connected-accounts && ./connect.sh -c Microsoft -r https://jwt.io -s "openid profile offline_access User.Read Calendars.Read"
# VISIT ./complete.sh -r https://jwt.io -a auth_session -c code
resource "local_file" "oidc-bash-myaccount-dot-dev" {
  filename = "${path.module}/../agent/oidc-bash/.env-myaccount"
  file_permission = "600"
  content  = <<-EOT
AUTH0_DOMAIN=id.${var.top_level_domain}
AUTH0_CLIENT_ID=${auth0_client.donor-cli.client_id}
AUTH0_CLIENT_SECRET=${data.auth0_client.donor-cli.client_secret}
USERNAME=${auth0_user.user1.email}
PASSWORD=${auth0_user.user1.password}
EOT
}

