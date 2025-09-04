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
    http = {
      source  = "hashicorp/http"
      version = "~> 3.5"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.0"
    }
  }
}

provider "auth0" {
  domain                       = var.auth0_domain
  client_id                    = var.auth0_tf_client_id
  client_assertion_signing_alg = var.auth0_tf_client_assertion_signing_alg
  client_assertion_private_key = file(var.auth0_tf_client_assertion_private_key_file)
}

provider "restapi" {
  uri = "https://api.airtable.com"

  headers = {
    Authorization = "Bearer ${var.airtable_personal_access_token}"
    Content-Type  = "application/json"
  }

  id_attribute = "id"

  write_returns_object = true
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

