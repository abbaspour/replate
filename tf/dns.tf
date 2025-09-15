locals {
  placeholder_ipv4 = "192.0.2.1" # placeholder IPv4 so traffic goes to worker routes
  placeholder_ipv6 = "100::"     # placeholder IPv6 so traffic goes to worker routes
}

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

# WWW subdomain records (target for the redirect)
/*
resource "cloudflare_dns_record" "www_a" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "www"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "www_aaaa" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "www"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}
*/

# IPv4 - A
resource "cloudflare_dns_record" "donor" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "donor"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "business" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "business"
  content = local.placeholder_ipv4
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "admin" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "admin"
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

resource "cloudflare_dns_record" "businessV6" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "business"
  content = local.placeholder_ipv6
  type    = "AAAA"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "adminV6" {
  zone_id = data.cloudflare_zone.replate-dev.zone_id
  name    = "admin"
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
