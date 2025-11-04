// -- sample org for supplier --
resource "auth0_organization" "test-supplier-org" {
  name = "acme-supplier"
  display_name = "ACME Supplier"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/D4D0BAQFVEDpTiYC7uA/company-logo_100_100/B4DZde9L2TGUAQ-/0/1749644787666/supplierpay_logo?e=1763596800&v=beta&t=R-N5Y11fjYevt4JFg7CEeSgSlsPc2HAR_Xml-jshytg"
  }
}

resource "auth0_organization_connections" "test-supplier-connections" {
  organization_id = auth0_organization.test-supplier-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-supplier-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@supplier.org"
  password = var.default-password
}

resource "auth0_user" "test-supplier-member" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
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


// -- sample org for test community --
resource "auth0_organization" "test-community-org" {
  name = "acme-community"
  display_name = "ACME Community"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/C560BAQHeJjOy9xiXAg/company-logo_200_200/company-logo_200_200/0/1630585785025/community_health_network_logo?e=1763596800&v=beta&t=4E7hgzesvOxL0TMAkcJT8jW1f1MXbHrKxJXouEmv0us"
  }
}

resource "auth0_organization_connections" "test-community-connections" {
  organization_id = auth0_organization.test-community-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-community-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@community.org"
  password = var.default-password
}

resource "auth0_user" "test-community-member" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "member@community.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-community-members" {
  organization_id = auth0_organization.test-community-org.id
  members = [
    auth0_user.test-community-admin.id,
    auth0_user.test-community-member.id
  ]
}

resource "auth0_organization_member_roles" "test-community-admin" {
  depends_on = [
    auth0_organization_members.test-community-members
  ]
  organization_id = auth0_organization.test-community-org.id
  roles = [
    auth0_role.community-admin.id
  ]
  user_id         = auth0_user.test-community-admin.id
}

resource "auth0_organization_member_roles" "test-community-members" {
  depends_on = [
    auth0_organization_members.test-community-members
  ]
  organization_id = auth0_organization.test-community-org.id
  roles = [
    auth0_role.community-member.id
  ]
  user_id         = auth0_user.test-community-member.id
}

// -- sample org for test logistics --
resource "auth0_organization" "test-logistics-org" {
  name = "acme-logistics"
  display_name = "ACME Logistics"
  branding {
    logo_url = "https://media.licdn.com/dms/image/v2/C4E0BAQHdZBFG1mvW3A/company-logo_200_200/company-logo_200_200/0/1630618643965/express_logistics_logo?e=1763596800&v=beta&t=Ibv8y78ymX4eYbJ4rzXKAkn8L4XIrq0imtoEeC5rSek"
  }
}

resource "auth0_organization_connections" "test-logistics-connections" {
  organization_id = auth0_organization.test-logistics-org.id
  enabled_connections {
    connection_id = auth0_connection.business-db.id
  }
}

resource "auth0_user" "test-logistics-admin" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "admin@logistics.org"
  password = var.default-password
}

resource "auth0_user" "test-logistics-driver" {
  depends_on = [auth0_connection.business-db]
  connection_name = auth0_connection.business-db.name
  email = "driver@logistics.org"
  password = var.default-password
}

resource "auth0_organization_members" "test-logistics-members" {
  organization_id = auth0_organization.test-logistics-org.id
  members = [
    auth0_user.test-logistics-admin.id,
    auth0_user.test-logistics-driver.id
  ]
}

resource "auth0_organization_member_roles" "test-logistics-admin" {
  depends_on = [
    auth0_organization_members.test-logistics-members
  ]
  organization_id = auth0_organization.test-logistics-org.id
  roles = [
    auth0_role.logistics-admin.id
  ]
  user_id         = auth0_user.test-logistics-admin.id
}

resource "auth0_organization_member_roles" "test-logistics-drivers" {
  depends_on = [
    auth0_organization_members.test-logistics-members
  ]
  organization_id = auth0_organization.test-logistics-org.id
  roles = [
    auth0_role.logistics-driver.id
  ]
  user_id         = auth0_user.test-logistics-driver.id
}


