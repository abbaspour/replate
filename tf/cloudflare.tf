# Cloudflare resources for Replate

# Creates a Cloudflare D1 database for CRM data. A future worker/API will connect to this DB.
resource "cloudflare_d1_database" "crm" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_d1_db_name
}

output "cloudflare_d1_crm_id" {
  description = "ID of the Cloudflare D1 CRM database"
  value       = cloudflare_d1_database.crm.id
}

output "cloudflare_d1_crm_name" {
  description = "Name of the Cloudflare D1 CRM database"
  value       = cloudflare_d1_database.crm.name
}
