# Temporary, not part of demo
resource "auth0_client" "hono-rwa" {
  name = "Hono RWA"
  description = "Hono RWA for SDK Gallery"
  app_type = "regular_web"

  callbacks = [
    "https://hono-rwa-myaccount.abbaspour.workers.dev/auth/callback"
  ]

  allowed_logout_urls = [
    "https://hono-rwa-myaccount.abbaspour.workers.dev/logout"
  ]

  grant_types = [
    "authorization_code",
    "refresh_token"
  ]
}

output "hono-client-id" {
  value = auth0_client.hono-rwa.client_id
}

resource "auth0_client_grant" "hono-myaccount-grant" {
  audience  = data.auth0_resource_server.my-account.identifier
  client_id = auth0_client.hono-rwa.client_id
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
