# Creates an event stream of type webhook
resource "auth0_event_stream" "crm" {
  name             = "crm"
  destination_type = "webhook"
  subscriptions = [
    "user.created",
    "user.updated",
    "user.deleted"
  ]

  webhook_configuration {
    webhook_endpoint = "https://admin.${var.top_level_domain}/api/events"

    webhook_authorization {
      method = "bearer"
      token  = random_string.event-api-token.result
    }
  }
}