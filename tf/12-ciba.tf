## Email Server
resource "auth0_email_provider" "mailtrap" {
  name                 = "smtp"
  enabled              = true
  default_from_address = "noreply@replate.dev"
  credentials {
    smtp_host = var.mailtrap_smtp_host
    smtp_port = var.mailtrap_smtp_port
    smtp_user = var.mailtrap_smtp_user
    smtp_pass = var.mailtrap_smtp_pass
  }
}

resource "auth0_phone_provider" "custom_phone_provider" {
  name                 = "custom"
  disabled              = false

  configuration {
    delivery_methods = ["text"]
  }

  credentials {}

  depends_on = [
    auth0_action.sms_to_slack
  ]
}

resource "auth0_action" "sms_to_slack" {

  depends_on = [null_resource.build_auth0_actions]

  name    = "SMS to Slack"
  runtime = "node22"
  deploy  = true
  code = file("${path.module}/../auth0/actions/dist/sms-to-slack.js")

  supported_triggers {
    id      = "custom-phone-provider"
    version = "v1"
  }

  dependencies {
    name    = "axios"
    version = "1.7.9"
  }

  secrets {
    name  = "SLACK_WEBHOOK_URL"
    value = var.slack_webhook_url
  }
}

# Create .dev.vars file for Cloudflare Workers - run `make update-cf-secrets` to update Cloudflare
# VISIT ./authorize.sh -B "Schedule Event" -H 'auth0|68ba32369ca0ebfcc421a537'
# VISIT ./exchange.sh -r auth_req_id
resource "local_file" "oidc-bash-dot-dev" {
  filename = "${path.module}/../agent/oidc-bash/.env"
  file_permission = "600"
  content  = <<-EOT
AUTH0_DOMAIN=id.${var.top_level_domain}
AUTH0_CLIENT_ID=${auth0_client.donor-cli.client_id}
AUTH0_CLIENT_SECRET=${data.auth0_client.donor-cli.client_secret}
EOT
}

