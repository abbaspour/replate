resource "auth0_self_service_profile" "ss-sso-profile" {
  name = "Replate Self-Service Single Sign On Onboarding"
  branding {
    logo_url = "https://donor.replate.dev/images/logo.png"
  }
  allowed_strategies = [
    "adfs",
    "google-apps",
    "keycloak-samlp",
    "oidc",
    "okta",
    "pingfederate",
    "samlp",
    "waad",
  ]
}