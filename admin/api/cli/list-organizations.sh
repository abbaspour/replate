#!/usr/bin/env bash

# Lists organizations from Admin API after validating token scopes with jq
# Requirements: curl, jq
# Usage:
#   ACCESS_TOKEN=... ADMIN_API_BASE_URL=https://api.admin.replate.dev ./list-organizations.sh
set -eo pipefail

command -v curl >/dev/null || { echo >&2 "error: curl not found"; exit 3; }
command -v jq >/dev/null || { echo >&2 "error: jq not found"; exit 3; }

# Env vars
: "${ADMIN_API_BASE_URL:=https://api.admin.replate.dev}"
: "${ACCESS_TOKEN:?ACCESS_TOKEN env var is required}"

REQUIRED_SCOPES=("read:organizations")

# Validate scopes in ACCESS_TOKEN (JWT) by decoding payload and checking scope string
function has_scopes() {
  local token="$1"
  local need=("${@:2}")
  # Decode middle part of JWT (payload)
  local payload
  # base64url decode with padding fix
  local b64
  b64=$(echo "$token" | awk -F. '{print $2}')
  # replace URL-safe chars
  b64=${b64//-/+}
  b64=${b64//_/\/}
  # pad with = to length multiple of 4
  local mod=$(( ${#b64} % 4 ))
  if [[ $mod -eq 2 ]]; then b64+="=="; elif [[ $mod -eq 3 ]]; then b64+="="; fi
  payload=$(echo "$b64" | base64 -d 2>/dev/null || true)
  if [[ -z "$payload" ]]; then
    echo "error: unable to decode JWT payload" >&2
    return 1
  fi
  # Use jq to assert each required scope exists in the space-delimited scope string
  for s in "${need[@]}"; do
    if ! echo "$payload" | jq -e --arg s "$s" '(.scope // "") | split(" ") | index($s) != null' >/dev/null; then
      echo "missing scope: $s" >&2
      return 2
    fi
  done
  return 0
}

has_scopes "$ACCESS_TOKEN" "${REQUIRED_SCOPES[@]}" || { echo "error: ACCESS_TOKEN missing required scopes" >&2; exit 2; }

# Call the Admin API
resp=$(curl -sS -H "Authorization: Bearer $ACCESS_TOKEN" -H 'accept: application/json' "$ADMIN_API_BASE_URL/organizations")

# Print pretty JSON or error
if echo "$resp" | jq -e . >/dev/null 2>&1; then
  echo "$resp" | jq .
else
  echo "$resp"
fi
