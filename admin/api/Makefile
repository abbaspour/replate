goal: build

build:
	npm run build

api-types: ./spec/openapi.yaml
	npx openapi-typescript ./spec/openapi.yaml --output ./src/api-types.ts

deploy:
	npx wrangler deploy

tail: log

log:
	npx wrangler tail