resource "auth0_tenant" "tenant" {
  friendly_name = "Replate"
  flags {
    enable_client_connections = false
  }

  # Configure supported languages
  enabled_locales = [
    "en",
    "ar"
  ]
}
