all: build

deploy:
	pnpm run deploy

dev:
	pnpm run dev

build:
	pnpm run build


format:
	pnpm run format

.PHONY: build deploy dev format

help:
	@echo "Available targets:"
	@echo "  all (default) - Build and deploy the project"
	@echo "  build         - Build the project with esbuild"
	@echo "  dev           - Start local dev server (wrangler dev)"
	@echo "  deploy        - Build and publish to Cloudflare Workers"