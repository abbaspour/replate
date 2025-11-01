# Okta Group for Replate Workforce employees
resource "okta_group" "replate_workforce" {
  provider = okta.admin
  name        = "Replate Workforce"
  description = "Group for all Replate workforce employees"
}

# RWA Application for Auth0 integration
resource "okta_app_oauth" "auth0_rwa" {
  provider = okta.admin
  label                      = "Auth0 Workforce Federation"
  type                       = "web"
  grant_types                = ["authorization_code"]
  redirect_uris              = ["https://${local.auth0_custom_domain}/login/callback"]
  post_logout_redirect_uris  = ["https://${local.auth0_custom_domain}/oidc/logout"]
  response_types             = ["code"]
  
  # Security settings
  token_endpoint_auth_method = "client_secret_post"
  
  # OIDC settings
  issuer_mode                = "DYNAMIC"
  
  # Group assignments
  //groups = [okta_group.replate_workforce.id]
}

resource "okta_app_group_assignments" "auth0-rwa-group-assignment" {
  provider = okta.admin
  app_id = okta_app_oauth.auth0_rwa.id
  group {
    id = okta_group.replate_workforce.id
  }
}

# Sample users for the workforce group
resource "okta_user" "workforce_user1" {
  provider = okta.admin
  first_name = "John"
  last_name  = "Smith"
  login      = "john.smith@replate.dev"
  email      = "john.smith@replate.dev"
  status     = "ACTIVE"
  password = var.default-password
}

resource "okta_user" "workforce_user2" {
  provider = okta.admin
  first_name = "Jane"
  last_name  = "Doe"  
  login      = "jane.doe@replate.dev"
  email      = "jane.doe@replate.dev"
  status     = "ACTIVE"
  password = var.default-password
}
# Assign users to the workforce group
resource "okta_group_memberships" "replate_workforce_members" {
  provider = okta.admin
  group_id = okta_group.replate_workforce.id
  users = [
    okta_user.workforce_user1.id,
    okta_user.workforce_user2.id
  ]
}


# Output the client credentials for Auth0 configuration
output "okta_rwa_client_id" {
  value = okta_app_oauth.auth0_rwa.client_id
  description = "Client ID for Auth0 Okta connection"
}

output "okta_domain" {
  value = "${var.okta_org_name}.${var.okta_base_url}"
  description = "Okta domain for Auth0 connection"
}