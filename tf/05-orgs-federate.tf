## -- Okta --
resource "okta_app_signon_policy" "only_1fa" {
  name        = "Replate Org 1FA policy"
  description = "Authentication Policy to be used simple apps."
}

resource "okta_app_signon_policy_rule" "only_1fa_rule" {
  policy_id                   = okta_app_signon_policy.only_1fa.id
  name                        = "Password only"
  factor_mode                 = "1FA"
  re_authentication_frequency = "PT43800H"
  status                      = "ACTIVE"
  constraints = [
    jsonencode({
      "knowledge" : {
        "required" : false
        "types" : ["password"]
      }
    })
  ]
}

# Okta Group for Federated Supplier employees
resource "okta_group" "supplier_workforce" {
  name        = "Supplier Workforce"
  description = "Group for all Supplier workforce employees"
}

# RWA Application for Auth0 integration
resource "okta_app_oauth" "replate-rwa" {
  label                      = "Replate Business Federation"
  type                       = "web"
  grant_types                = ["authorization_code"]
  redirect_uris              = ["https://${local.auth0_custom_domain}/login/callback"]
  post_logout_redirect_uris  = ["https://${local.auth0_custom_domain}/oidc/logout"]
  response_types             = ["code"]

  # Security settings
  token_endpoint_auth_method = "client_secret_post"

  # OIDC settings
  issuer_mode                = "DYNAMIC"

  authentication_policy = okta_app_signon_policy.only_1fa.id
}

resource "okta_app_group_assignments" "replate-rwa-group-assignment" {
  app_id = okta_app_oauth.replate-rwa.id
  group {
    id = okta_group.supplier_workforce.id
  }
}

# Sample users for the workforce group
resource "okta_user" "supplier-io_admin" {
  first_name = "Adam"
  last_name  = "Supplier"
  login      = "admin@supplier.io"
  email      = "admin@supplier.io"
  status     = "ACTIVE"
  password = var.default-password
}

resource "okta_user" "supplier-io_member" {
  first_name = "Maria"
  last_name  = "Supplier"
  login      = "member@supplier.io"
  email      = "member@supplier.io"
  status     = "ACTIVE"
  password = var.default-password
}


# Assign users to the workforce group
resource "okta_group_memberships" "supplier-io_members" {
  group_id = okta_group.supplier_workforce.id
  users = [
    okta_user.supplier-io_admin.id,
    okta_user.supplier-io_member.id
  ]
}

## -- Auth0 --
# supplier federation connection
resource "auth0_organization" "fed-supplier-org" {
  name = "fed-supplier"
  display_name = "Federated Supplier"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/C560BAQEyAJ6vJjid9w/company-logo_200_200/company-logo_200_200/0/1675790205789/supplier_io_logo?e=1763596800&v=beta&t=iIYumFn6g-wqcUrS9OFlF9P1dBN2Q7vVPRLMeq39oRQ"
  }
}

resource "auth0_connection" "fed-supplier_workforce" {
  name     = "fed-supplier-workforce"
  strategy = "okta"

  options {
    client_id     = okta_app_oauth.replate-rwa.client_id
    client_secret = okta_app_oauth.replate-rwa.client_secret
    domain        = "${var.okta_org_name}.${var.okta_base_url}"
    domain_aliases = ["supplier.io"]

    # Scopes
    scopes = ["openid", "profile", "email", "groups"]

    upstream_params = jsonencode({
      "screen_name" : {
        "alias" : "login_hint"
      }
    })

    connection_settings {
      pkce = "auto"
    }

    attribute_map {
      mapping_mode   = "basic_profile"
      userinfo_scope = "openid email profile groups"
      attributes = jsonencode({
        "name" : "$${context.tokenset.name}",
        "email" : "$${context.tokenset.email}",
        "email_verified" : "$${context.tokenset.email_verified}",
        "nickname" : "$${context.tokenset.nickname}",
        "picture" : "$${context.tokenset.picture}",
        "given_name" : "$${context.tokenset.given_name}",
        "family_name" : "$${context.tokenset.family_name}"
      })
    }

    # Set email as username
    set_user_root_attributes = "on_each_login"
  }
}

# Enable the connection for the Replate organization
resource "auth0_connection_clients" "fed-supplier_workforce_clients" {
  connection_id   = auth0_connection.fed-supplier_workforce.id
  enabled_clients = [
    auth0_client.business.client_id
  ]
}

resource "auth0_organization_connections" "fed-supplier-connections" {
  organization_id = auth0_organization.fed-supplier-org.id
  enabled_connections {
    connection_id = auth0_connection.fed-supplier_workforce.id
    assign_membership_on_login = true
  }
}
