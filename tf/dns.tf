locals {
  placeholder_ipv4 = "192.0.2.1" # placeholder IPv4 so traffic goes to worker routes
  placeholder_ipv6 = "100::"     # placeholder IPv6 so traffic goes to worker routes
}

# Get the DNS zone for the top level domain
data "cloudflare_zone" "replate-dev" {
  filter = {
    name = var.top_level_domain
  }
}

# IPv4 - A
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

