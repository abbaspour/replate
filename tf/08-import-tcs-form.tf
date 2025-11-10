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
        "consent_required" = true
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

# VISIT https://manage.auth0.com/dashboard/au/replate-prd/import-export-users
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/users/YXV0aDAlN0M2OTA5OTdhNjRkNjY3MmNjNTdkNDRlN2E
resource "local_file" "bulk_import" {
  content  = jsonencode(local.sample_users)
  filename = "${path.module}/../auth0/bulk-import/bulk-import.json"
}


# Load the privacy policy form and its embedded flow from exported JSON
locals {
  flow_update_metadata          = jsondecode(file("${path.module}/../auth0/forms/privacy-policy.json"))["flows"]["#FLOW-1#"]
  form_privacy_policy          = jsondecode(file("${path.module}/../auth0/forms/privacy-policy.json"))["form"]
}

# Flow Vault Connection for Post-Login Privacy Policy Form
# This connection allows the action to fetch data using an M2M client with read/update users permissions.
resource "auth0_flow_vault_connection" "post_login_privacy_policy_form-vc" {
  app_id = "AUTH0"
  name   = "post-login-privacy-policy-form-vc"
  account_name = var.auth0_domain

  setup = {
    client_id     = auth0_client.m2m_client_update_read_users.client_id
    client_secret = data.auth0_client.m2m_client_update_read_users.client_secret
    domain        = var.auth0_domain
    type          = "OAUTH_APP"
  }
}

resource "auth0_flow" "update_metadata" {
  name = "Udpdate Metadata"
  actions = replace(
    jsonencode(local.flow_update_metadata["actions"]),
    "#CONN-1#", auth0_flow_vault_connection.post_login_privacy_policy_form-vc.id
  )
}

resource "auth0_form" "privacy_policy" {
  name = "Privacy Policy Form"
  languages {
    primary = "en"
  }
  start  = jsonencode(local.form_privacy_policy["start"])
  ending = jsonencode(local.form_privacy_policy["ending"])
  nodes = replace(jsonencode(local.form_privacy_policy["nodes"]), "#FLOW-1#", auth0_flow.update_metadata.id)
}

# Create the action
data "local_file" "render_privacy_policy_form_code" {
  filename = "${path.module}/../auth0/actions/dist/render-privacy-policy-form.js"
}

resource "auth0_action" "render_privacy_policy_form-action" {
  name    = "render-privacy-policy-form"
  code    = data.local_file.render_privacy_policy_form_code.content
  depends_on = [null_resource.build_auth0_actions]
  deploy = true

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  secrets {
    name  = "PRIVACY_POLICY_FORM_ID"
    value = auth0_form.privacy_policy.id
  }

}


