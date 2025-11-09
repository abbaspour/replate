# Creates an event stream of type webhook
# VISIT https://dash.cloudflare.com/871edd29c9370fb8a2d45359ab45d544/workers/d1/databases/2e03b343-2b17-4adc-850f-82f6c1b58dea/studio
# VISIT https://manage.auth0.com/dashboard/au/replate-prd/events/event-streams/est_sAis7edooj36SMLMbaeiHD/overview
resource "auth0_event_stream" "crm" {
  name             = "crm"
  destination_type = "webhook"
  subscriptions = [
    // user
    "user.created",
    "user.updated",
    "user.deleted",
    // organization
    "organization.created",
    "organization.updated",
    "organization.deleted"
  ]

  webhook_configuration {
    webhook_endpoint = "https://admin.${var.top_level_domain}/api/events"

    webhook_authorization {
      method = "bearer"
      token  = random_string.event-api-token.result
    }
  }
}