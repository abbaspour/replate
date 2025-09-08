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

data "auth0_connection" "Username-Password-Authentication" {
  name = "Username-Password-Authentication"
}

data "auth0_client" "default-app" {
  name = "Default App"
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