#!/usr/bin/env bash

declare D1_DB_NAME='replate-crm'

@echo "Listing all companies from D1 Orgs..."
wrangler d1 execute ${D1_DB_NAME} --command="SELECT * FROM Organizations ORDER BY org_type, id;" --remote
