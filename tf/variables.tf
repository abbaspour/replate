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
  default = "PS256"
}

# HubSpot
variable "hubspot_private_app_token" {
  type      = string
  sensitive = true
}