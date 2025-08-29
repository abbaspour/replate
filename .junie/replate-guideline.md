# Replate Project Guideline
Replate is a hypothetical start-up to demonstrate Auth0's B2C, B2B, SaaS and AI capabilities.
The goal of this project is to provide reusable assets and patterns to Auth0 customers, showing them how the Auth0 platform works and how they can leverage it in their own business use cases.

Note that since the purpose of this demo project is to showcase Auth0, some functionalities may not be fully implemented. The goal of this repo is to be an informative demo rather than a fully functional code base.

## Business Case

Replate aims is to use technology to reduce food waste.
// TODO: stats on how much food is wasted in commercial venues

Replate connects three groups of entities within its platform:

- **Suppliers** are business locations that occasionally have an oversupply of food, such as restaurants, venues, bakeries, and grocery stores.
- **Communities** are locations where food can be shipped to consume or redistribute among those in need. Think of shelters, charities, aged care centres, and humanitarian organisations.
- **Logistics** are transport companies that have spare capacity to transport food from suppliers to communities.

Replate allows suppliers to inform that they have an oversupply of food. Supplies can do this by raising an ad-hoc request or scheduling a cadence for food collection. Think of Replate as Uber for food.

Replate then reviews communities that signed up for food and allocates any available capacity from logistics companies to pick up and deliver the food supply to those in need. Replate schedules the transport and informs suppliers, community managers, and transport drivers of the next steps.

Alongside business use cases, Replate has a consumer-facing side that allows people to support the initiative by donating money and suggesting businesses that Replate can connect to.


## Platform and Integration
We have a high-level working prototype that's built on top of the following integrations

- Websites, including static `www.` websites and two SPA websites  `donor.` (for consumers) and `app.` (for businesses), are all hosted on Cloudflare workers.
- Auth0 for CIAM
- HubSpot for CRM
- Terraform for platform provisioning
- [ReactAdmin](https://marmelab.com/react-admin/) is a front-end SPA technology for business website `app.` 
- Client side React is a front-end SPA technology for consumer website `donor.`
- The static website is using plain HTML/CSS
- Okta is the Workforce identity for Replate employees
- API is built with [Hono](https://hono.dev) and TypeScript
- Mailtrap as an SMTP server for email communications
- Makefile, npm and wrangler for executing build and deployment

## Project Folder Structure

- **tf/** Terraform scripts to provision project in Cloudflare, Auth0 and other platforms
- **websites/** static website contents
    - **websites/replate.dev** static website for www.replate.dev
    - **websites/reuse.dev** static website for reuse.dev
- **donor/** single page application (SPA) with React and Auth0 SDK
- **app/** single page application (SPA) with ReactAdmin and Auth0 SDK
- **api/** server-side API protected by access_token issued by Auth0 and built with Hono SDK running on top of Cloudflare ESM worker
- **native/** native apps
    - **/native/ios/** native app for iOS in Swift/Auth0
    - **/native/android/** native app for Android in Kotlin/Auth0

The source code is managed as a monorepo. Each subproject (`app/`, `donor/`, `api/`) has its own `package.json`.

All projects (`/app`, `/donor`, `/api`) rely on a `.env` file for configuration. A template file named `.env.example` exists in each project's root. Terraform populates `.env` files with operational configuration such as `AUTH0_CLIENT_ID` and `CALLBACK_URL`.


## Domain names
The following are business subdomains under top top-level domain name `replate.dev`

- **www.** static website with a landing page showing a picture of a donation and a counter of how many plates of food are saved
  On the top right side of the website, there is a Login button. When clicked, the Login button shows a dropdown to Login to Consumer App or Business App.
    - If the user is already logged in (detected by Auth0 SDK), the top right of the website shows a button to go to the app and log out.
- **donor.** SPA app (using Auth0 SDK) that is for consumer persona (Donor)
- **app.** SPA app (using Auth0 SDK) that is for business user personas (see Actors section for details)
- **api.** Is shared API protected by CORS and Auth0 issued bearer access_token
    - **/consumer/** are consumer APIs used by **donor** subdomain
    - **/business/** are business APIs used by **app** subdomain
      APIs don't have storage on their own. They use the Auth0 management API or HubSpot CRM as the source of truth.
- **id.** Auth0 self-managed custom domain. This is a proxy Cloudflare worker against Replate's production Auth0 tenant.

All subdomains are powered by Cloudflare ESM workers and Cloudflare DNS. SPA sites use workers with assets and `not_found_handling = "single-page-application"` flag.

## Actors and Use-cases

### Donor
Donor is a normal consumer user who can sign up and log in to `donor` website.

As a donor, a user can:

1. **Sign up** with their email. Auth0 verifies their email during sign-up by sending an OTP
2. **Login** to donor website
3. Once logged in, they can **donate money** via a form. Money raised is used to support the operations of Replate
4. See **history** of their donations; indicating date and amount. This is for tax purposes.
5. **Suggest** new supplier or communities.
6. Donors can sign up & log in with their social account (Google, Facebook, Apple) as well as credentials.

### Replate Admin
Replate Admin is a member of the Replate workforce who can run business operations in the app.

Use cases:
1. **Onboard** new supplier, community or logistics organization; Admin does this by calling Auth0 API for self-service SSO.
2. In the app, users can see a list of suppliers, community, or logistics organisations. These are modelled as organisations in Auth0 and fetched by calling the Auth0 management API.

### Supplier Admin
Supplier Admin is a member of the supplier organisation in Auth0.

1. Accepts self-service SSO invitation from Replate Admin and completes the self-service setup against their workforce IDP.
2. Update the address of the supplier's pick-up location

### Supplier Member
Supplier Member is a member of a supplier organisation in Auth0.

1. Can log in to the app website with the SSO that their admin has set up. SSO is powered with HRD (Home Realm Discovery), such as when email is matched for the company domain, like `member@supplier.com`, the user is redirected to the supplier's IdP at `idp.supplier.com`
2. Can view and update pick-up schedule.
3. Can request ad-hoc pick up.

### Logistics Admin
Logistics Admin is a member of the logistics organisation in Auth0

1. Accepts self-service SSO invitation from Replate Admin and completes the self-service setup against their workforce IDP.

### Driver
Driver is a member of the logistics organisation in Auth0

1. Can log in to app website with the SSO that their admin has set up. SSO is powered by HRD.
2. Can view the list of deliveries assigned to them and their pickup location and address.
3. Mark delivery in progress.
4. Mark delivery as completed.


### Community Admin
Logistics Admin is a member of a community organisation in Auth0

1. Accepts self-service SSO invitation from Replate Admin and completes the self-service setup against their workforce IDP.
2. Update the address of the community's delivery location

### Community Member
Logistics Member is a member of a community organisation in Auth0

1. Can log in to the app website with the SSO that their admin has set up. SSO is powered with HRD.
2. Can view and update the delivery schedule.

## CRM Objects & properties

The API layer doesn't have a DB layer on its own. Two sources of backend for the API are:

1. Auth0 CIAM data is accessed with the Auth0 management API. To access data, the API layer has a confidential M2M client with the Auth0 management API granted and occasionally performs a client credentials grant to obtain a valid access token to call the management API.
2. HubSpot CRM - API layer has a stored secret HUBSPOT_PRIVATE_APP_ACCESS_TOKEN to perform CRUD operations, such a creating a lead.

### 1) Contact (standard) - For everyone (donors + business users).

Every person who logs into Replate is a user. Regardless of being a business user or consumer.

Data is federated between Auth0 and HubSpot. The API layer is responsible for combining this data when needed. The Auth0 `user_id` is the primary key for the user in Auth0, and in HubSpot, `contact_id` is the primary key.

The link between an Auth0 user and a HubSpot contact is bidirectional. In the Auth0 user profile, `app_metadata.contact_id` points to their HubSpot Contact ID. Auth0's user_id is stored against `contact.auth0_user_id` in CRM, which provides a bidirectional mapping between Contact (HubSpot) ↔ User (Auth0).

Profile information, like name and picture, is synced from Auth0 to HubSpot using Auth0 user events.

Auth0 has a Post-Logic / Post-User-Registration Action that guarantees all users have CRM `contact_id`. If the `app_metadata.contact_id` field is missing, the Action will detect that and call the HubSpot create contact API to create a contact for this user in HubSpot and store the resulting `id` in the user's `app_metadata. `contact_id`.

Each Contact belongs to exactly one Organization (Company), and donors may belong to none.

* Keys: `auth0_user_id` (text, unique), `email` (primary), `auth0_org_id` (text; nullable for donors)
* Properties:
    * `org_role` (enum): `admin`, `member`, `driver`

### 2) Company (standard) – Represents Supplier, Community, Logistics
Businesses are stored as organization in Auth0. Each Auth0 organization has a `metadata.type` in Auth0 data that indicates its type. Type can be one of: `community`, `logistics` or `supplier`.

Businesses are also modelled in HubSpot as companies. We use Auth0 Event streams to sync organizations from Auth0 into companies in  HubSpot.

The company domain stored in CRM is the same domain used for email-based HRD (Home Realm Discovery) federation to their IdP.

* Keys: `auth0_org_id` (text, unique), `org_type` (enum: `supplier`, `community`, `logistics`)
* Properties:
    * `org_type`: (enum: `supplier`, `community`, `logistics`)
    * `sso_status`: (enum: `not_started`, `invited`, `configured`,`active`)
    * Org profile (`name`, `domains`, `addresses`) flows Auth0 → HubSpot via Auth0 Events
    * Supplier-specific
        * `pickup_address` (text)
        * `pickup_schedule` (text / structured JSON blob if needed)
    * Community-specific
        * `delivery_address` (text)
        * `delivery_schedule`
    * Logistics-specific
        * `coverage_regions`
        * `vehicle_types`

### 3) Donation (custom object) – donor payments
* Keys: `donation_id`
* Properties:
    * `amount_cents`, `currency`, `status` (enum), `created_at`
    * `stripe_payment_intent_id` / `stripe_charge_id`
* Associations:
    * donation ↔ contact (donor)

### 4) Pickup Request (custom object) – supplier → logistics scheduling
* Keys: `pickup_id`
* Properties:
    * `type` (enum: `scheduled`, `ad_hoc`)
    * `status` (enum pipeline): `new`, `triage`, `logistics_assigned`, `in_transit`, `delivered`, `cancelled`
    * `ready_at`, `pickup_window_start`, `pickup_window_end`, `food_category`, `estimated_weight_kg`, `packaging`, `handling_notes`
* Associations:
    * pickup ↔ company (supplier) (required)
    * pickup ↔ company (community) (destination)
    * pickup ↔ company (logistics) (once assigned)
    * pickup ↔ contact (driver) (when assigned)

### 5) Suggestion (custom object) – consumer-submitted leads
* Keys: `suggestion_id`
* Properties:
    * type (enum: `supplier`, `community`, `logistics`)
    * `name`, `address`, `submitted_at`, `qualification_status` (enum)
* Associations:
    * suggestion ↔ contact (submitter)
    * (Optionally) suggestion ↔ company once converted

## API Contract
The API follows the OpenAPI 3.0 specification. The full contract is defined in `api/openapi.yml`. All development must adhere to this contract.

### Consumer API (`/consumer`)
- **`GET /consumer/donations`**: Retrieves the donation history for the logged-in user.
    - **Permissions**: Requires a token with `read:donations` permission.
    - read Donation COs by contactId associated with auth0_user_id
- **`POST /consumer/donations/create-payment-intent`**: Creates a Payment Intent.
    - **Request Body**: `{ "amount": 5000 }` (in cents)
    - **Permissions**: Authenticated user.
- **`POST /consumer/suggestions`**: Submits a suggestion for a new supplier/community.
    - **Request Body**: `{ "type": "supplier", "name": "Local Bakery", "address": "456 Oak Ave" }`
    - **Permissions**: Authenticated user.
    - create Suggestion CO; return suggestion_id


### Business API (`/business`)
- **`GET /business/organizations/{orgId}`**: Retrieves details for a specific organization.
    - **Permissions**: Requires a token with `read:organization` permission. User must be a member of `{orgId}`.
- **`PATCH /business/organizations/{orgId}`**: Updates organization details (e.g., address).
    - **Request Body**: `{ "metadata": { "delivery_address": "123 Main St" } }`
    - **Permissions**: Requires a token with `update:organization` permission. User must be an 'Admin' of `{orgId}`.
- **`GET /business/pickups`**: Fetches a list of pickups for the user's organization.
    - **Permissions**: Requires a token with `read:pickups` permission.
    - list Pickup COs (filter by caller’s Company via Membership)
- **`POST /business/pickups`**: Creates a new ad-hoc pickup request.
    - **Permissions**: Requires a token with `create:pickups` permission.
    - create Pickup CO; set supplier_company_id from caller’s org

## Authorization Model
This section governs how access_token issued by Auth0 is consumed by API and which claims control which API.

### Scopes & permissions
TBA

### Organization Membership
TBA


