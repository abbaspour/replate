# Creates an event stream of type webhook
# VISIT https://dash.cloudflare.com/871edd29c9370fb8a2d45359ab45d544/workers/d1/databases/2e03b343-2b17-4adc-850f-82f6c1b58dea/studio
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/events/event-streams/est_sAis7edooj36SMLMbaeiHD/overview
resource "auth0_event_stream" "crm" {
  name             = "crm"
  destination_type = "webhook"
  subscriptions = [
    // user
    "user.created",
    "user.updated",
    "user.deleted",
    // organization
    "organization.created",
    "organization.updated",
    "organization.deleted"
  ]

  webhook_configuration {
    webhook_endpoint = "https://admin.${var.top_level_domain}/api/events"

    webhook_authorization {
      method = "bearer"
      token  = random_string.event-api-token.result
    }
  }
}

## SCIM (in okta has to be saml2.0)
resource "okta_app_saml" "replate-scim" {
  provider = okta.business
  label                      = "Replate Business SCIM"

  sso_url                  = "https://${var.auth0_subdomain}.${var.top_level_domain}/login/callback"
  recipient                = "https://${var.auth0_subdomain}.${var.top_level_domain}/login/callback"
  destination              = "https://${var.auth0_subdomain}.${var.top_level_domain}/login/callback"
  audience                 = "urn:auth0:${var.auth0_domain}:scim"
  subject_name_id_template = "$${user.userName}"
  subject_name_id_format   = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
  response_signed          = true
  signature_algorithm      = "RSA_SHA256"
  digest_algorithm         = "SHA256"
  honor_force_authn        = false
  authn_context_class_ref  = "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"
  implicit_assignment        = false

  authentication_policy = okta_app_signon_policy.only_1fa.id
}

resource "okta_app_group_assignments" "replate-scim-assignment" {
  provider = okta.business
  app_id = okta_app_saml.replate-scim.id
  group {
    id = okta_group.supplier_workforce.id
  }
}

# VISIT https://manage.auth0.com/dashboard/au/replate-prd/connections/enterprise/okta/con_ceDoMwIiUlVYFyld/provisioning
# VISIT https://amin-admin.okta.com/admin/app/amin_replatebusinessscim_1/instance/0oa770ckjgjer1gvL3l7/#tab-user-management/create-n-update
resource "auth0_connection_scim_configuration" "okta_scim_configuration_default" {
  connection_id = auth0_connection.fed-supplier_workforce.id
}