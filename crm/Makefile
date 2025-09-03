.PHONY: list

all: contact

install:
	npm install -g @hubspot/cli@latest

auth:
	hs account auth

contact:
	# Unique identifier from Auth0 for the user
	hs property create contact auth0_user_id -l="Auth0 User ID" -t="string" --has-unique-value

	# Associated Auth0 Organization ID
	hs property create contact auth0_org_id -l="Auth0 Organization ID" -t="string"

	# User's role within their organization
	hs property create contact org_role -l="Organization Role" -t="enumeration" -e="admin;member;driver"

company:
	# Unique identifier from Auth0 for the organization
	hs property create company auth0_org_id -l="Auth0 Organization ID" -t="string" --has-unique-value

	# Type of partner organization
	hs property create company org_type -l="Organization Type" -t="enumeration" -e="supplier;community;logistics"

	# SSO configuration status
	hs property create company sso_status -l="SSO Status" -t="enumeration" -e="not_started;invited;configured;active"

	# Supplier-specific properties
	hs property create company pickup_address -l="Pickup Address" -t="string" -g="supplier_information"
	hs property create company pickup_schedule -l="Pickup Schedule" -t="string" -f="textarea" -g="supplier_information"

	# Community-specific properties
	hs property create company delivery_address -l="Delivery Address" -t="string" -g="community_information"
	hs property create company delivery_schedule -l="Delivery Schedule" -t="string" -f="textarea" -g="community_information"

	# Logistics-specific properties
	hs property create company coverage_regions -l="Coverage Regions" -t="string" -f="textarea" -g="logistics_information"
	hs property create company vehicle_types -l="Vehicle Types" -t="string" -f="textarea" -g="logistics_information"