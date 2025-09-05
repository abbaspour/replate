locals {
  auth0_custom_domain = "${var.auth0_subdomain}.${var.top_level_domain}"
}
// -- cloudflare worker --
resource "cloudflare_dns_record" "cf-worker-fetch_verification_record" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  type = "CNAME"
  name = local.auth0_custom_domain
  ttl     = 300
  content = "replate-prd-cd-cxtx7g73zqykcr6v.edge.tenants.au.auth0.com"
}

/*
locals {
  worker_name = "replate-auth0-custom-domain-fetch"
  worker_path = "${path.module}/../auth0/custom-domain"
}


# Deploy the worker script
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
      namespace_id = ""
    },
    {
      name = "CNAME_API_KEY"
      type = "secret_text"
      text = auth0_custom_domain_verification.cf-worker-fetch_verification.cname_api_key
      namespace_id = ""
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

// -- dns
resource "auth0_custom_domain" "cf-worker-fetch" {
  domain = "${var.auth0_subdomain}.${var.top_level_domain}"
  type   = "self_managed_certs"
  custom_client_ip_header = "cf-connecting-ip"
  domain_metadata = {
    server = "cloudflare-worker-fetch"
  }
}

resource "auth0_custom_domain_verification" "cf-worker-fetch_verification" {
  depends_on = [cloudflare_dns_record.cf-worker-fetch_verification_record]

  custom_domain_id = auth0_custom_domain.cf-worker-fetch.id

  timeouts { create = "15m" }
}

resource "cloudflare_dns_record" "cf-worker-fetch_verification_record" {
  zone_id = data.cloudflare_zone.main_domain.zone_id # var.cloudflare_zone_id
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
*/

# Configure custom domain for the worker
/*resource "cloudflare_workers_custom_domain" "auth0_custom_domain_fetch" {
  account_id  = var.cloudflare_account_id
  zone_id     = var.cloudflare_zone_id
  hostname    = "${var.auth0_subdomain}.${var.top_level_domain}"
  service     = local.worker_name
  environment = ""
}
*/

