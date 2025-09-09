# Auth0 resource server for donor API
resource "auth0_resource_server" "admin_api" {
  name       = "Admin API"
  identifier = "admin.api"

  # Token settings
  token_lifetime                                  = 86400  # 24 hours
  skip_consent_for_verifiable_first_party_clients = true

  # JWT settings
  signing_alg = "RS256"

  # Allow refresh tokens for better UX
  allow_offline_access = false
}

resource "auth0_resource_server_scopes" "admin_api_scopes" {
  resource_server_identifier = auth0_resource_server.admin_api.id

  scopes {
    name = "read:organizations"
    description = "read:organizations"
  }
  scopes {
    name = "update:organizations"
    description = "update:organizations"
  }
  scopes {
    name = "create:organizations"
    description = "create:organizations"
  }
  scopes {
    name = "read:org_invitations"
    description = "read:org_invitations"
  }
  scopes {
    name = "create:org_invitations"
    description = "create:org_invitations"
  }
}
