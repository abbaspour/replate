# Auth0 resource server for donor API
resource "auth0_resource_server" "business_api" {
  name       = "Business API"
  identifier = "business.api"
  
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
resource "auth0_client" "business" {
  name            = "Business SPA"
  description     = "Business SPA client"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://business.${var.top_level_domain}"
  ]

  allowed_logout_urls = [
    "https://business.${var.top_level_domain}"
  ]

  web_origins = [
    "https://business.${var.top_level_domain}"
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
  "audience": "${auth0_resource_server.business_api.identifier}",
  "redirectUri": "https://business.${var.top_level_domain}"
}
EOT
}

