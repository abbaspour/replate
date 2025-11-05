data "cloudflare_zone" "replate-uk" {
  filter = {
    name = var.top_level_domain-uk
  }
}

# Apex (root) domain records - required for redirecting replate.dev -> www.replate.dev
resource "cloudflare_dns_record" "uk-root_a" {
  zone_id = data.cloudflare_zone.replate-uk.zone_id
  name    = "@"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "uk-root_aaaa" {
  zone_id = data.cloudflare_zone.replate-uk.zone_id
  name    = "@"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

# Redirect apex to www using Cloudflare Page Rule (301)
resource "cloudflare_page_rule" "uk-root_to_www" {
  zone_id  = data.cloudflare_zone.replate-uk.zone_id
  target   = "${var.top_level_domain-uk}/*"
  priority = 1

  status   = "active"
  actions = {
    forwarding_url = {
      url         = "https://www.${var.top_level_domain-uk}/$1"
      status_code = 301
    }
  }
}

# donor subdomain IPv4 - A
resource "cloudflare_dns_record" "donor-uk" {
  zone_id = data.cloudflare_zone.replate-uk.zone_id
  name    = "donor"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

# donor subdomain IPv6 - AAAA
resource "cloudflare_dns_record" "donorV6-uk" {
  zone_id = data.cloudflare_zone.replate-uk.zone_id
  name    = "donor"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

# Custom Domain for UK
locals {
  auth0_custom_domain-uk = "${var.auth0_subdomain}.${var.top_level_domain-uk}"
  worker_name-uk = "replate-auth0-custom-domain-fetch-uk"
}

# Deploy the worker script
# VISIT https://dash.cloudflare.com/871edd29c9370fb8a2d45359ab45d544/workers/services/view/replate-auth0-custom-domain-fetch/production/settings
resource "cloudflare_workers_script" "auth0_custom_domain_fetch-uk" {
  account_id         = var.cloudflare_account_id
  script_name        = local.worker_name-uk
  content_file       = "${local.worker_path}/index.mjs"
  content_sha256     = filesha256("${local.worker_path}/index.mjs")
  main_module        = "index.mjs"
  compatibility_date = "2025-09-03"

  bindings = [
    {
      name = "AUTH0_EDGE_LOCATION"
      type = "secret_text"
      text = auth0_custom_domain_verification.cf-worker-fetch_verification-uk.origin_domain_name
    },
    {
      name = "CNAME_API_KEY"
      type = "secret_text"
      text = auth0_custom_domain_verification.cf-worker-fetch_verification-uk.cname_api_key
    }
  ]

  placement = {
    mode = "smart"
  }

  observability = {
    enabled = true
    logs = {
      enabled            = true
      head_sampling_rate = 1
      invocation_logs    = true
      persist            = false
    }
  }

  #migrations = {}

  lifecycle {
    ignore_changes = [
      placement
    ]
  }
}

// VISIT https://manage.auth0.com/dashboard/au/replate-prd/tenant/custom_domains
resource "auth0_custom_domain" "cf-worker-fetch-uk" {
  domain = "${var.auth0_subdomain}.${var.top_level_domain-uk}"
  type   = "self_managed_certs"
  custom_client_ip_header = "cf-connecting-ip"
}

resource "auth0_custom_domain_verification" "cf-worker-fetch_verification-uk" {
  depends_on = [cloudflare_dns_record.cf-worker-fetch_verification_record-uk]

  custom_domain_id = auth0_custom_domain.cf-worker-fetch-uk.id

  timeouts { create = "15m" }
}

resource "cloudflare_dns_record" "cf-worker-fetch_verification_record-uk" {
  zone_id = data.cloudflare_zone.replate-uk.zone_id
  type = upper(auth0_custom_domain.cf-worker-fetch-uk.verification[0].methods[0].name)
  name = auth0_custom_domain.cf-worker-fetch-uk.verification[0].methods[0].domain
  ttl     = 300
  content = "\"${auth0_custom_domain.cf-worker-fetch-uk.verification[0].methods[0].record}\""
}

# Create .env file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
resource "local_file" "cf-worker-fetch-dot_env-uk" {
  filename = "${local.worker_path}/.env-uk"
  file_permission = "600"
  content  = <<-EOT
CNAME_API_KEY=${auth0_custom_domain_verification.cf-worker-fetch_verification-uk.cname_api_key}
AUTH0_EDGE_LOCATION=${auth0_custom_domain_verification.cf-worker-fetch_verification-uk.origin_domain_name}
EOT
}


# Configure custom domain for the worker
resource "cloudflare_workers_custom_domain" "auth0_custom_domain_fetch-uk" {
  account_id  = var.cloudflare_account_id
  zone_id     = data.cloudflare_zone.replate-uk.zone_id
  hostname    = "${var.auth0_subdomain}.${var.top_level_domain-uk}"
  service     = local.worker_name-uk
  environment = "production"
}
