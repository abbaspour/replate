# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Replate is a monorepo demonstrating Auth0 B2C, B2B/Organizations, and SaaS capabilities. It connects suppliers (restaurants, bakeries) with communities (shelters, charities) via logistics companies to reduce food waste, built on Cloudflare Workers + D1 databases + Auth0.

## Architecture

### Component Structure
- **admin/**: Admin workforce interface and API for Replate employees
  - `admin/api/`: Hono-based API worker with D1 database for organization management
  - `admin/spa/`: React Admin interface for managing organizations and SSO invitations
  - `admin/db/`: D1 database DDL for admin operations
- **business/**: Multi-tenant business interface for suppliers, logistics, and communities
  - `business/api/`: Hono-based API worker with D1 database for job/schedule management
  - `business/spa/`: React SPA for business users with Auth0 Organizations
  - `business/db/`: D1 database DDL for business operations
- **donor/**: Consumer-facing donation interface
  - `donor/api/`: Hono-based API worker with D1 database for donations
  - `donor/spa/`: Static vanilla JS SPA for donor interactions
  - `donor/db/`: D1 database DDL for donor operations
- **auth0/**: Auth0 configuration, Actions, and supporting infrastructure
- **tf/**: Terraform scripts for provisioning Cloudflare, Auth0, and integrations
- **websites/**: Static marketing websites

### Technology Stack
- **APIs**: Hono framework on Cloudflare Workers with TypeScript
- **Databases**: Cloudflare D1 (one per component: admin, business, donor)
- **Frontend**: React 19 (business/admin SPAs), vanilla JS (donor SPA)
- **Auth**: Auth0 with Organizations, RBAC, and custom domains
- **Infrastructure**: Cloudflare Workers, Terraform
- **Build**: npm, wrangler, Make

## Common Commands

### API Development (admin/api, business/api, donor/api)
```bash
# Generate TypeScript types from OpenAPI spec
make api-types

# Build the worker
make build

# Deploy to Cloudflare
make deploy

# View logs
make log  # or make tail

# Format code
make format

# Update worker secrets from .env
make update-cf-secrets
```

### SPA Development (admin/spa, business/spa, donor/spa)
```bash
# Install dependencies
make install  # or npm ci

# Start local development
make dev

# Build for production
make build

# Deploy to Cloudflare
make deploy
```

### Database Operations
Each database directory (admin/db, business/db, donor/db) contains:
- DDL files for schema creation
- Drop scripts for cleanup
- CLI scripts for common operations

### Root Level
```bash
# Generate PDF documentation from readme.md
make pdf
```

## Key Implementation Details

### API Structure
- All APIs use Hono framework with Cloudflare Workers runtime
- OpenAPI 3.1 specifications in `*/api/spec/openapi.yaml`
- Auto-generated TypeScript types via `openapi-typescript`
- OAuth2 bearer token authentication with Auth0
- CORS configuration for respective frontend domains

### Database Design
- Per-component D1 databases with federated Auth0 user data
- `auth0_user_id` links D1 records to Auth0 profiles
- Organizations stored in Auth0, synced to D1 via event streams
- Role-based permissions mapped to API endpoints

### Authentication Flow
- SPAs use Auth0 SPA SDK with PKCE
- Configuration loaded from `public/auth_config.json`
- Business app requires `org_id` claim for multi-tenancy
- Admin app restricted to Replate workforce (Okta federation)

### Deployment Pattern
- Each component deploys independently via wrangler
- Static assets served via Cloudflare Workers Sites
- Environment configuration via Terraform-populated .env files
- Domain routing: `admin.replate.dev`, `business.replate.dev`, `donor.replate.dev`

## Important Configuration Files
- `*/wrangler.toml`: Cloudflare Worker configuration
- `*/public/auth_config.json`: Auth0 SPA configuration
- `*/spec/openapi.yaml`: API contract definitions
- `.env`: Environment variables (populated by Terraform)

## Testing and Linting
Check individual component package.json files for available npm scripts. Common patterns:
- `npm run format`: Code formatting
- `npm run build`: Production builds
- `npm run dev`: Development servers