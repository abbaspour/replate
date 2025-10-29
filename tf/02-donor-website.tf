resource "auth0_tenant" "tenant" {
  friendly_name = "Replate"
  flags {
    enable_client_connections = false
  }
  sandbox_version = "22"

  # Configure supported languages
  enabled_locales = [
    "en",
    "ar"
  ]
}

data "auth0_resource_server" "api_v2" {
  identifier = "https://${var.auth0_domain}/api/v2/"
}

data "auth0_connection" "Username-Password-Authentication" {
  name = "Username-Password-Authentication"
}

data "auth0_client" "default-app" {
  name = "Default App"
}

resource "auth0_prompt" "profile" {
  universal_login_experience     = "new"
  identifier_first               = true
  webauthn_platform_first_factor = false
}

# sample users
resource "auth0_user" "user1" {
  connection_name = data.auth0_connection.Username-Password-Authentication.name
  email           = "user1@atko.email"
  password        = "user1@atko.email"
}



# VISIT https://manage.auth0.com/dashboard/au/replate-prd/connections/database/con_owPfvhuFwnFzkfjh/attributes
resource "auth0_connection" "Username-Password-Authentication" {
  name     = "Username-Password-Authentication"
  strategy = "auth0"

  options {
    brute_force_protection = false
    attributes {
      email {
        unique = true
        signup {
          status = "required"
          verification {
            active = true
          }
        }
        identifier {
          active = true
        }
        profile_required = true
        verification_method = "otp"
      }
    }
  }
}

resource "auth0_connection_clients" "UPA-clients" {
  connection_id = data.auth0_connection.Username-Password-Authentication.id
  enabled_clients = [
    auth0_client.donor.client_id,
    var.auth0_tf_client_id,
    data.auth0_client.default-app.client_id,
    auth0_client.donor-cli.client_id,
  ]
}


# Auth0 resource server for donor API
resource "auth0_resource_server" "donor_api" {
  name       = "Donor API"
  identifier = "donor.api"

  # Token settings
  token_lifetime                                  = 86400 # 24 hours
  skip_consent_for_verifiable_first_party_clients = true

  # JWT settings
  signing_alg = "RS256"

  # Allow refresh tokens for better UX
  allow_offline_access = false
}

# VISIT https://manage.auth0.com/dashboard/au/replate-prd/applications/G5DiwGQsKOuwPIw7dOEIfmfu34inCljx/settings
resource "auth0_client" "donor" {
  name            = "Donor SPA"
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


  allowed_origins = [
    "https://donor.${var.top_level_domain}"
  ]


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
    "domain" : local.auth0_custom_domain,
    "clientId" : auth0_client.donor.client_id,
    "audience" : auth0_resource_server.donor_api.identifier,
    "redirectUri" : "https://donor.${var.top_level_domain}"
    # "redirectUri": "http://localhost:8787"
  })
}

resource "auth0_action" "claims" {
  name    = "Claims Post Login Action"
  runtime = "node22"
  deploy  = true
  code    = file("${path.module}/../auth0/actions/dist/post-login-claims.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }
}

# IPv4 - A
resource "cloudflare_dns_record" "donor" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "donor"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

# IPv6 - AAAA
resource "cloudflare_dns_record" "donorV6" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "donor"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

# Custom Domain
locals {
  auth0_custom_domain = "${var.auth0_subdomain}.${var.top_level_domain}"
  worker_name = "replate-auth0-custom-domain-fetch"
  worker_path = "${path.module}/../auth0/custom-domain"
}

# Deploy the worker script
# VISIT https://dash.cloudflare.com/871edd29c9370fb8a2d45359ab45d544/workers/services/view/replate-auth0-custom-domain-fetch/production/settings
resource "cloudflare_workers_script" "auth0_custom_domain_fetch" {
  account_id         = var.cloudflare_account_id
  script_name        = local.worker_name
  content_file       = "${local.worker_path}/index.mjs"
  content_sha256     = filesha256("${local.worker_path}/index.mjs")
  main_module        = "index.mjs"
  compatibility_date = "2025-09-03"

  bindings = [
    {
      name = "AUTH0_EDGE_LOCATION"
      type = "plain_text"
      text = auth0_custom_domain_verification.cf-worker-fetch_verification.origin_domain_name
    },
    {
      name = "CNAME_API_KEY"
      type = "secret_text"
      text = auth0_custom_domain_verification.cf-worker-fetch_verification.cname_api_key
    }
  ]

  placement = {
    mode = "smart"
  }

  #migrations = {}

  lifecycle {
    ignore_changes = [
      placement
    ]
  }
}

// VISIT https://manage.auth0.com/dashboard/au/replate-prd/tenant/custom_domains
resource "auth0_custom_domain" "cf-worker-fetch" {
  domain = "${var.auth0_subdomain}.${var.top_level_domain}"
  type   = "self_managed_certs"
  custom_client_ip_header = "cf-connecting-ip"
}

resource "auth0_custom_domain_verification" "cf-worker-fetch_verification" {
  depends_on = [cloudflare_dns_record.cf-worker-fetch_verification_record]

  custom_domain_id = auth0_custom_domain.cf-worker-fetch.id

  timeouts { create = "15m" }
}

resource "cloudflare_dns_record" "cf-worker-fetch_verification_record" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id # var.cloudflare_zone_id
  type = upper(auth0_custom_domain.cf-worker-fetch.verification[0].methods[0].name)
  name = auth0_custom_domain.cf-worker-fetch.verification[0].methods[0].domain
  ttl     = 300
  content = "\"${auth0_custom_domain.cf-worker-fetch.verification[0].methods[0].record}\""
}

# Create .env file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
resource "local_file" "cf-worker-fetch-dot_env" {
  filename = "${local.worker_path}/.env"
  file_permission = "600"
  content  = <<-EOT
CNAME_API_KEY=${auth0_custom_domain_verification.cf-worker-fetch_verification.cname_api_key}
AUTH0_EDGE_LOCATION=${auth0_custom_domain_verification.cf-worker-fetch_verification.origin_domain_name}
EOT
}


# Configure custom domain for the worker
resource "cloudflare_workers_custom_domain" "auth0_custom_domain_fetch" {
  account_id  = var.cloudflare_account_id
  zone_id     = data.cloudflare_zone.replate-dev.zone_id
  hostname    = "${var.auth0_subdomain}.${var.top_level_domain}"
  service     = local.worker_name
  environment = "production"
}


