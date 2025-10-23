#!/usr/bin/env bash
# add-org.sh — Insert an Organization row into Cloudflare D1 via Wrangler
#
# Usage:
#   ./add-org.sh -t <supplier|logistics|community> -a <auth0_org_id>
#
# Notes:
# - Reads D1 database name from ./wrangler.toml (database_name). Falls back to "replate-crm".
# - Requires Wrangler CLI to be installed and authenticated.
# - Inserts minimal required fields: auth0_org_id, org_type, name (defaults to auth0_org_id).

set -euo pipefail

show_usage() {
  echo "Usage: $0 -t <supplier|logistics|community> -a <auth0_org_id>" >&2
}

# Defaults
TYPE=""
AUTH0_ID=""
NAME=""

# Parse args
while getopts ":t:a:n:h" opt; do
  case $opt in
    t)
      TYPE="${OPTARG}" ;;
    a)
      AUTH0_ID="${OPTARG}" ;;
    n)
      NAME="${OPTARG}" ;;
    h)
      show_usage; exit 0 ;;
    :) echo "Error: Option -$OPTARG requires an argument" >&2; show_usage; exit 2 ;;
    \?) echo "Error: Invalid option -$OPTARG" >&2; show_usage; exit 2 ;;
  esac
done

# Validate args
if [[ -z "$TYPE" || -z "$AUTH0_ID" || -z "$NAME" ]]; then
  echo "Error: -t, -a and -n are required" >&2
  show_usage
  exit 2
fi

if [[ "$TYPE" != "supplier" && "$TYPE" != "logistics" && "$TYPE" != "community" ]]; then
  echo "Error: -t must be one of: supplier, logistics, community" >&2
  exit 2
fi

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Error: wrangler CLI is not installed or not in PATH" >&2
  exit 1
fi

# Resolve D1 database name from wrangler.toml or fallback
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WRANGLER_TOML="${SCRIPT_DIR}/wrangler.toml"
DB_NAME="replate-crm"
if [[ -f "$WRANGLER_TOML" ]]; then
  # Extract the value inside quotes after database_name = "..."
  PARSED_DB_NAME=$(awk -F'"' '/database_name/ {print $2}' "$WRANGLER_TOML" | head -n1 || true)
  if [[ -n "${PARSED_DB_NAME}" ]]; then
    DB_NAME="${PARSED_DB_NAME}"
  fi
fi

# Minimal required columns: auth0_org_id, org_type, name

SQL="INSERT INTO Organizations (auth0_org_id, org_type, name) VALUES ('$AUTH0_ID', '$TYPE', '$NAME');"

echo "Inserting organization into D1 database '${DB_NAME}'..."
wrangler d1 execute "${DB_NAME}" --command "${SQL}" --remote

echo "Done."
