terraform {
  required_version = "~> 1.0"
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = ">= 1.27.0"
    }
    restapi = {
      source  = "Mastercard/restapi"
      version = ">= 2.0.1"
    }
  }
}

provider "auth0" {
  domain                      = var.auth0_domain
  client_id                   = var.auth0_tf_client_id
  client_assertion_signing_alg = var.auth0_tf_client_assertion_signing_alg
  client_assertion_private_key = file(var.auth0_tf_client_assertion_private_key_file)
}

provider "restapi" {
  uri                    = "https://api.hubapi.com"

  headers = {
    Authorization = "Bearer ${var.hubspot_private_app_token}"
    Content-Type  = "application/json"
  }

  # HubSpot props: POST/GET/PATCH/DELETE
  create_method          = "POST"
  read_method            = "GET"
  update_method          = "PATCH"
  destroy_method         = "DELETE"

  # Use property `name` as the resource ID (e.g., /contacts/{name})
  id_attribute           = "name"

  # HubSpot returns full objects on writes; let the provider read IDs from responses
  write_returns_object   = true
}

