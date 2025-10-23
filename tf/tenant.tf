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

resource "auth0_prompt" "profile" {
  universal_login_experience     = "new"
  identifier_first               = true
  webauthn_platform_first_factor = false
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