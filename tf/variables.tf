# Auth0
variable "auth0_domain" {
  description = "The Auth0 tenant domain (e.g., your-tenant.us.auth0.com)"
  type        = string
}

variable "auth0_tf_client_id" {
  description = "The Client ID for the Auth0 Machine-to-Machine application used by Terraform"
  type        = string
}

variable "auth0_tf_client_assertion_private_key_file" {
  type = string
  description = "Path to the private key file for Terraform client assertion"
  default = "terraform-jwt-ca-private.pem"
}

variable "auth0_tf_client_assertion_signing_alg" {
  type = string
  description = "Algorithm used for signing client assertion"
  default = "RS256"
}

# Domain configuration for Auth0 custom domain
variable "top_level_domain" {
  description = "Top level domain name (e.g., replate.dev)"
  type        = string
  default     = "replate.dev"
}

variable "auth0_subdomain" {
  description = "Subdomain for Auth0 custom domain (e.g., 'id' for id.replate.dev)"
  type        = string
  default     = "id"
}

# Cloudflare
variable "cloudflare_api_key" {
  type        = string
  description = "Cloudflare API Key."
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID where resources will be created."
}

variable "cloudflare_email" {
  type        = string
  description = "Cloudflare Account Email"
}

variable "cloudflare_d1_db_name" {
  type        = string
  description = "Name for the CRM D1 database."
  default     = "replate-crm"
}

## okta
variable "okta_org_name" {
  type        = string
  description = "Okta org name"
}

/*
variable "okta_tf_client_id" {
  type        = string
  description = "Terraform client_id"
}
*/

variable "okta_tf_api_token" {
  type        = string
  description = "Terraform API token"
  sensitive = true
}

variable "okta_base_url" {
  type = string
  default = "okta.com"
}

## LinkedIn Social
variable "linkedin_client_id" {
  type = string
  description = "LinkedIn social connection client_id"
}

variable "linkedin_client_secret" {
  type = string
  description = "LinkedIn social connection client_secret"
}

variable "linkedin_user_email" {
  type = string
  description = "database user with a matching email for linkedin social"
}

## Facebook Social
variable "facebook_client_id" {
  type = string
  description = "Facebook social connection client_id"
}

variable "facebook_client_secret" {
  type = string
  description = "Facebook social connection client_secret"
}

variable "facebook_user_email" {
  type = string
  description = "database user with a matching email for facebook social"
}


## AoB
variable "default-password" {
  type = string
  sensitive = true
}