SHELL := /bin/bash

.PHONY: plan apply

all: plan

LOG_LEVEL='' # DEBUG

generate-keys: terraform-jwt-ca-public.pem

terraform-jwt-ca-private.pem:
	@echo "Generating RS256 key pair for Auth0 client assertion..."
	openssl genpkey -algorithm RSA -out terraform-jwt-ca-private.pem -pkeyopt rsa_keygen_bits:2048

terraform-jwt-ca-public.pem: terraform-jwt-ca-private.pem
	openssl rsa -pubout -in terraform-jwt-ca-private.pem -out terraform-jwt-ca-public.pem
	@echo "Keys generated: terraform-jwt-ca-private.pem and terraform-jwt-ca-public.pem"

init:
	terraform init -input=false -upgrade

plan:
	terraform plan

deploy: apply

apply:
	terraform apply -auto-approve
