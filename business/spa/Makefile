all: build

deploy:
	npm run deploy

dev:
	npm run dev

build:
	npm run build

.PHONY: build deploy dev

help:
	@echo "Available targets:"
	@echo "  all (default) - Build and deploy the project"
	@echo "  build         - Build the project with esbuild"
	@echo "  dev           - Start local dev server (wrangler dev)"
	@echo "  deploy        - Build and publish to Cloudflare Workers"