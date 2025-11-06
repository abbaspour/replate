all: build

build:
	pnpm run build

deploy:
	npx wrangler deploy

dev:
	npx wrangler dev

.PHONY: build deploy dev

clean:
	rm -rf public/dist

help:
	@echo "Available targets:"
	@echo "  all (default) - Build and deploy the project"
	@echo "  build         - Build the project (noop)"
	@echo "  dev           - Start local dev server (wrangler dev)"
	@echo "  deploy        - Publish to Cloudflare Workers"