goal: help

SECRETS_FILE = .env

build:
	npm run build

api-types: ./spec/openapi.yaml
	npx openapi-typescript ./spec/openapi.yaml --output ./src/api-types.ts

deploy:
	npx wrangler deploy

tail: log

log:
	npx wrangler tail

format:
	npm run format

update-cf-secrets:
	npx wrangler secret bulk $(SECRETS_FILE)

help:
	@echo "Available targets:"
	@echo "  all (default) 		- Build the project"
	@echo "  build         		- Build the project using webpack"
	@echo "  deploy        		- Deploy the worker to Cloudflare"
	@echo "  api-types     		- OpenAPI spec to code"
	@echo "  log|tail      		- Tail worker logs"
	@echo "  format      		- format code"
	@echo "  update-cf-secrets 	- Update worker secrets from $(SECRETS_FILE)"
	@echo "  help          		- Show this help message"