# VISIT https://manage.auth0.com/dashboard/au/replate-prd/security/access-control
# VISIT https://www.netify.ai/resources/tor/country/au
resource "auth0_network_acl" "network-acl" {
  active      = true
  description = "Log authentication traffic from AU and IN"
  priority    = 10

  rule {
    action {
      log = true
    }
    scope = "authentication"
    match {
      geo_country_codes     = ["AU", "IN"]
    }
  }
}