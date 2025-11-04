locals {
  sample_count          = 2
  sample_domain         = "secondbite.com"
  # printf "%s%s" "SALT" "PASSWORD" | openssl dgst -sha256
  sample_hashed_password = "dedfee565bd096c0de0157d508bfee957ea6b0a6297bce2b81df517fdcf48e16"
  sample_hashed_salt     = "SALT"
  sample_hash_algorithm  = "sha256"

  sample_users = [
    for i in range(local.sample_count) : {
      email          = "user${i}@${local.sample_domain}"
      email_verified = true
      family_name    = "Imported"
      given_name     = "User${i}"
      app_metadata = {
        "consent-required" = true
      }
      custom_password_hash = {
        algorithm = local.sample_hash_algorithm
        hash = {
          value    = local.sample_hashed_password
          encoding = "hex"
        }
        salt = {
          value    = local.sample_hashed_salt
          position = "prefix"
        }
      }
    }
  ]
}

resource "local_file" "bulk_import" {
  content  = jsonencode(local.sample_users)
  filename = "${path.module}/../auth0/bulk-import/bulk-import.json"
}

