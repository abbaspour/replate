// -- sample db and sample org --
resource "auth0_connection" "test-supplier-org-db" {
  name     = "test-supplier"
  strategy = "auth0"
}

resource "auth0_connection_clients" "test-supplier-org-db-clients" {
  connection_id = auth0_connection.test-supplier-org-db.id
  enabled_clients = [
    var.auth0_tf_client_id,
    data.auth0_client.default-app.client_id,
    auth0_client.business.client_id
  ]
}

resource "auth0_organization" "test-supplier-org" {
  name = "test-supplier"
  display_name = "test-supplier"
}

resource "auth0_organization_connections" "test-supplier-connections" {
  organization_id = auth0_organization.test-supplier-org.id
  enabled_connections {
    connection_id = auth0_connection.test-supplier-org-db.id
  }
}

resource "auth0_user" "test-supplier-admin" {
  connection_name = auth0_connection.test-supplier-org-db.name

  email = "admin@supplier.org"
  password = var.default-password
}

resource "auth0_user" "test-supplier-member" {
  connection_name = auth0_connection.test-supplier-org-db.name

  email = "member@supplier.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-supplier-members" {
  organization_id = auth0_organization.test-supplier-org.id
  members = [
    auth0_user.test-supplier-admin.id,
    auth0_user.test-supplier-member.id
  ]
}

resource "auth0_organization_member_roles" "test-supplier-admin" {
  depends_on = [
    auth0_organization_members.test-supplier-members
  ]
  organization_id = auth0_organization.test-supplier-org.id
  roles = [
    auth0_role.supplier-admin.id
  ]
  user_id         = auth0_user.test-supplier-admin.id
}

resource "auth0_organization_member_roles" "test-supplier-members" {
  depends_on = [
    auth0_organization_members.test-supplier-members
  ]
  organization_id = auth0_organization.test-supplier-org.id
  roles = [
    auth0_role.supplier-member.id
  ]
  user_id         = auth0_user.test-supplier-member.id
}