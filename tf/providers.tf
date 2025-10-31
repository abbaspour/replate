terraform {
  required_version = "~> 1.0"
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = ">= 1.32"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.9"
    }
    okta = {
      source  = "okta/okta"
      version = ">= 6.0"
    }
    null = {
      source  = "hashicorp/null"
      version = ">= 3.2"
    }
  }
}

provider "auth0" {
  domain                       = var.auth0_domain
  client_id                    = var.auth0_tf_client_id
  client_assertion_signing_alg = var.auth0_tf_client_assertion_signing_alg
  client_assertion_private_key = file(var.auth0_tf_client_assertion_private_key_file)
}

provider "cloudflare" {
  email   = var.cloudflare_email
  api_key = var.cloudflare_api_key
}

provider "okta" {
  org_name    = var.okta_org_name
  base_url    = var.okta_base_url
  api_token = var.okta_tf_api_token
  alias = "business"
}

provider "okta" {
  org_name    = var.okta_admin_org_name
  base_url    = var.okta_admin_base_url
  api_token = var.okta_admin_tf_api_token
  alias = "admin"
}

