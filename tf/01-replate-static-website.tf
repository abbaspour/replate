# Apex (root) domain records - required for redirecting replate.dev -> www.replate.dev
resource "cloudflare_dns_record" "root_a" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "@"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "root_aaaa" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "@"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}


# Redirect apex to www using Cloudflare Page Rule (301)
resource "cloudflare_page_rule" "root_to_www" {
  zone_id  = data.cloudflare_zone.replate-dev.zone_id
  target   = "${var.top_level_domain}/*"
  priority = 1

  status   = "active"
  actions = {
    forwarding_url = {
      url         = "https://www.${var.top_level_domain}/$1"
      status_code = 301
    }
  }
}
