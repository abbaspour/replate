# simple SPA client
resource "auth0_client" "donor" {
  name            = "Donor"
  description     = "Donor SPA client"
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

  organization_usage = "deny"
}

# Generate wrangler.toml file for the CRM directory
resource "local_file" "donor_auth_config_json" {
  filename = "${path.module}/../donor/spa/public/auth_config.json"
  content  = <<-EOT
{
  "domain": "${local.auth0_custom_domain}",
  "clientId": "${auth0_client.donor.client_id}"
}
EOT
}
