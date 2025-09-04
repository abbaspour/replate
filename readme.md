# Replate Project Guideline

Replate is a hypothetical start-up to demonstrate Auth0's B2C, B2B, SaaS and AI capabilities. The goal of this project
is to provide reusable assets and patterns to Auth0 customers, showing them how the Auth0 platform works and how they
can leverage it in their own business use cases.

Note that since the purpose of this demo project is to showcase Auth0, some functionalities may not be fully
implemented. The goal of this repo is to be an informative demo rather than a fully functional code base.

## Business Case

Replate aims to use technology to reduce food waste.
// TODO: stats on how much food is wasted in commercial venues

Replate connects three groups of entities within its platform:

- **Suppliers** are business locations that occasionally have an oversupply of food, such as restaurants, venues,
  bakeries, and grocery stores.
- **Communities** are locations where food can be shipped to consume or redistribute among those in need. Think of
  shelters, charities, aged care centres, and humanitarian organisations.
- **Logistics** are transport companies that have spare capacity to transport food from suppliers to communities.

Replate allows suppliers to inform that they have an oversupply of food. Suppliers can do this by raising an ad-hoc
request or scheduling a cadence for food collection. Think of Replate as Uber for food.

Replate then reviews communities that signed up for food and allocates any available capacity from logistics companies
to pick up and deliver the food supply to those in need. Replate schedules the transport and informs suppliers,
community managers, and transport drivers of the next steps.

Alongside business use cases, Replate has a consumer-facing side that allows people to support the initiative by
donating money and suggesting businesses that Replate can connect to.

## Platform and Integration

We have a high-level working prototype that's built on top of the following integrations:

- Websites, including static `www.` websites and two SPA websites `donor.` (for consumers) and `app.` (for businesses),
  are all hosted on Cloudflare workers.
- Auth0 for CIAM
- Cloudflare D1 for our core operational database and CRM
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
    - **websites/reuse.dev** static website for www.reuse.dev
- **admin/** Replate administration user App and API
    - **admin/spa** single page application (SPA) with ReactAdmin and Auth0 SDK for admin users. Only members of Replate
      Organization can log in to this website
    - **damin/api** APIs that power admin app
- **donor/** Consumer user App and API
    - **consumer/spa** single page application (SPA) with React and Auth0 SDK for consumer users
    - **consumer/api** APIs that power donor app built
- **business/** Business user App and API
    - **business/spa** single page application (SPA) with ReactAdmin and Auth0 SDK for business users
    - **business/api** APIs that power business app
- **crm/** Data model SQL files and scripts
- **ciam/** Auth0 configuration and supporting assets
    - **ciam/actions** Actions source code
    - **ciam/api** contains API exposed to Auth0 for Event streaming and Actions
- **native/** native apps
    - **native/ios** native app for iOS in Swift/Auth0
    - **native/android** native app for Android in Kotlin/Auth0

The source code is managed as a monorepo. Each subproject (`app/`, `donor/`, `api/`) has its own `package.json`.

All code folders (like `/app`, `/donor`, `/api`) rely on a `.env` file for configuration. A template file named
`.env.example` exists in each project's root. Terraform populates `.env` files with operational configuration such as
`AUTH0_CLIENT_ID` and `CALLBACK_URL`.

All apis are with Hono SDK, accept Auth0 issued access_token and deployed on top of Cloudflare ESM worker.

## Domain names

The following are business subdomains under top-level domain name `replate.dev`:

- **www.** static website with a landing page showing a picture of a donation and a counter of how many plates of food
  are saved. On the top right side of the website, there is a Login button. When clicked, the Login button shows a
  dropdown to log in to Consumer App or Business App.
    - If the user is already logged in (detected by Auth0 SDK), the top right of the website shows a button to go to the
      app and log out.
- **donor.** SPA app (using Auth0 SDK) that is for consumer persona (Donor)
    - **api.donor.** are consumer APIs used by **donor** app; protected by CORS and Auth0 issued bearer access_token
- **app.** SPA app (using Auth0 SDK) that is for business user personas (see Actors section for details)
    - **api.app.** are business APIs used by **app** subdomain; protected by CORS and Auth0 issued bearer access_token
- **id.** Auth0 self-managed custom domain. This is a proxy Cloudflare worker against Replate's production Auth0 tenant.
- **api.id.** Webhook that receives events from Auth0. Authenticate with a static bearer token and deployed as a
  Cloudflare worker.

All subdomains are powered by Cloudflare ESM workers and Cloudflare DNS. SPA sites use workers with assets and
`not_found_handling = "single-page-application"` flag.

## Actors and Use-cases

### Donor

Donor is a normal consumer user who can sign up and log in to `donor` website.

As a donor, a user can:

1. **Sign up** with their email. Auth0 verifies their email during sign-up by sending an OTP
2. **Login** to donor website
3. Once logged in, they can **donate money** via a form. Money raised is used to support the operations of Replate
4. See **history** of their donations; indicating date and amount. This is for tax purposes.
5. **Suggest** new supplier or communities.
6. Donors can sign up & log in with their **social account** (Google, Facebook, Apple) as well as credentials.

### Replate Admin

Replate Admin is a member of the Replate workforce who can run business operations in the app.

Use cases:

1. **Onboard** new supplier, community or logistics organization; Admin does this by calling Auth0 API for self-service SSO.
2. See a list of suppliers, community, or logistics organisations. These are modelled as organisations in Auth0 and
   fetched by calling the Auth0 management API.

### Supplier Admin

Supplier Admin is a member of the supplier organisation in Auth0.

1. **Accepts self-service SSO invitation** from Replate Admin and completes the self-service setup against their
   workforce IDP.
2. **Update the address** of the supplier's pick-up location

### Supplier Member

Supplier Member is a member of a supplier organisation in Auth0.

1. Can **log in** to the app website with the SSO that their admin has set up. SSO is powered with HRD (Home Realm
   Discovery), such as when email is matched for the company domain, like `member@supplier.com`, the user is redirected
   to the supplier's IdP at `idp.supplier.com`
2. Can **view and update pick-up schedule**.
3. Can **request ad-hoc pick up**.

### Logistics Admin

Logistics Admin is a member of the logistics organisation in Auth0

1. **Accepts self-service SSO invitation** from Replate Admin and completes the self-service setup against their
   workforce IDP.
2. **Update the details** of the logistics company.

### Driver

Driver is a member of the logistics organisation in Auth0

1. Can **log in** to app website with the SSO that their admin has set up. SSO is powered by HRD.
2. Can **view the list of deliveries** assigned to them and their pickup location and address.
3. Mark delivery **in progress**.
4. Mark delivery as **completed**.

### Community Admin

Community Admin is a member of a community organisation in Auth0

1. **Accepts self-service SSO invitation** from Replate Admin and completes the self-service setup against their
   workforce IDP.
2. **Update the address** of the community's delivery location

### Community Member

Community Member is a member of a community organisation in Auth0

1. Can **log in** to the app website with the SSO that their admin has set up. SSO is powered with HRD.
2. Can **view and update the delivery schedule**.

## Core Data Model in Airtable

The API layer doesn't have a DB layer on its own. Two sources of backend for the API are:

1. Auth0 CIAM data is accessed with the Auth0 management API. To access data, the API layer has a confidential M2M
   client with the Auth0 management API granted and occasionally performs a client credentials grant to obtain a valid
   access token to call the management API.
2. Cloudflare D1 relational database. Contains a mirror of users and organizations from Auth0 as well as other
   operational tables like Pickups, Suggestions, Donation.

### 1) `Contact` Table

Every person who logs into Replate is a user. This table stores all users, regardless of whether they are a business
user or a consumer.

Data is federated between Auth0 and D1. The API layer is responsible for combining this data when needed. The Auth0
`user_id` is the primary key in Auth0, and in D1, the AUTOINCREMENT Contact `id` is the primary key.

The link between an Auth0 user and an D1 record is bidirectional. In the Auth0 user profile, `app_metadata.contact_id`
points to their D1 Contact ID. Auth0's `user_id` is stored in a custom `auth0_user_id` field in the D1 record.

An Auth0 Post-User-Registration Action ensures all users have a corresponding record in D1. If the
`app_metadata.contact_id` field is missing, the Action calls `api.id.` API to create a record in the `Contact` table and
stores the resulting Record ID in the user's `app_metadata`.

- **Primary Key**: `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields**:
    - `auth0_user_id` (Text, Unique)
    - `email` (Text)
    - `email_verified` (boolean)
    - `name`, `picture` (synced from Auth0)
    - `donor` (boolean)
    - `org_role` (Single Select: `admin`, `member`, `driver`; nullable for donors)
    - `org_status` (Single Select: `invited`, `active`, `suspended`)
    - `sso_enrolled` (Checkbox), `sso_provider` (Text)
    - `consumer_lifecycle_stage` (Single Select: `visitor`, `registered`, `donor_first_time`, `donor_repeat`,
      `advocate`)
- **Associations**:
    - Linked to one record in the `Company` table (for business users).

### 2) `Company` Table

Represents a Supplier, Community, or Logistics organization.

Businesses are stored as organizations in Auth0. We use Auth0 Event Streams to sync organizations from Auth0 into
records in this table. The company domain stored here is the same domain used for email-based HRD federation.

- **Primary Key**: `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields**:
    - `auth0_org_id` (Text, Unique)
    - `org_type` (Single Select: `supplier`, `community`, `logistics`)
    - `name`, `domains` (synced from Auth0)
    - `sso_status` (Single Select: `not_started`, `invited`, `configured`, `active`)
    - `pickup_address` (Text, for Suppliers)
    - `pickup_schedule` (Long Text / JSON, for Suppliers)
    - `delivery_address` (Text, for Communities)
    - `delivery_schedule` (Long Text / JSON, for Communities)
    - `coverage_regions` (Long Text, for Logistics)
    - `vehicle_types` (Multiple Select, for Logistics)
- **Associations**:
    - Linked to many records in the `Contact` table (the members of the company).

### 3) `Donation` Table

Tracks all monetary donations from consumer users (Donors).

- **Primary Key**: `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields**:
    - `donation_id` (Autonumber or UUID)
    - `amount` (Currency), `currency` (Single Select), `status` (Single Select)
    - `created_at` (Created Time)
    - `testimonial` (Long Text)
- **Associations**:
    - Linked to one record in the `Contact` table (the Donor).

### 4) `PickupSchedule` Table

This table defines the recurring pickup arrangements (i.e., "standing orders"). It acts as a template for creating
individual PickupJob records.

- **Primary Key**: id (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields:**
- `supplier_id` (FK to `Company` table)
- `default_community_id` (FK to `Company` table)
- `is_active` (Boolean)
- `cron_expression` (Text, e.g., 0 19 * * 1-5 for 7 PM on weekdays)
- `pickup_time_of_day` (Time)
- `pickup_duration_minutes` (Integer)
- `default_food_category` (Multiple Select)
- `default_estimated_weight_kg` (Number)
- **Associations**:
    - Linked to one record in `Company` (the Supplier).
    - Has a one-to-many relationship with the `PickupJob` table.

### 5) `PickupJob` Table

This table tracks the lifecycle of a single, concrete pickup event, whether it was generated from a schedule or created
as an ad-hoc request.

- **Primary Key**: id (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields:**
- `schedule_id` (FK to PickupSchedule table, nullable) - If NULL, this is an ad-hoc request.
- `status` (Single Select pipeline: `New`, `Triage`, `Logistics Assigned`, `In Transit`, `Delivered`, `Canceled`)
- `pickup_window_start` (DateTime), `pickup_window_end` (DateTime)
- `food_category` (Multiple Select),
- `estimated_weight_kg` (Number),
- `packaging` (Long Text),
- `handling_notes` (Long Text)
- **Associations**:
    - Linked to one record in Company (the Supplier).
    - Linked to one record in Company (the destination Community).
    - Linked to one record in Company (the assigned Logistics partner).
    - Linked to one record in Contact (the assigned Driver).
    - (Optionally) Linked to one record in PickupSchedule.

### 6) `Suggestion` Table

Captures new leads for potential partners, submitted by consumers.

- **Primary Key**: `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- **Fields**:
    - `type` (Single Select: `supplier`, `community`, `logistics`)
    - `name` (Text), `address` (Text)
    - `submitted_at` (Created Time)
    - `qualification_status` (Single Select: `New`, `Contacted`, `Qualified`, `Rejected`)
- **Associations**:
    - Linked to one record in `Contact` (the Submitter).
    - (Optionally) Linked to one record in `Company` once the suggestion is converted into a partner.

## API Contract

The API follows the OpenAPI 3.1 specification.

### Consumer API

The full contract is defined in `consumer/api/openapi.yml`. All development must adhere to this contract.

- **`GET /donations`**: Retrieves the donation history for the logged-in user.
    - **Permissions**: Requires a token with `read:donations` permission.
    - **Implementation**: Reads records from the `Donation` table, filtering by the User record associated with the
      caller's `auth0_user_id`.
- **`POST /donations/create-payment-intent`**: Creates a Payment Intent.
    - **Request Body**: `{ "amount": 50.00 }` (in dollars)
    - **Permissions**: Authenticated user.
- **`POST /suggestions`**: Submits a suggestion for a new supplier/community.
    - **Request Body**: `{ "type": "supplier", "name": "Local Bakery", "address": "456 Oak Ave" }`
    - **Permissions**: Authenticated user.
    - **Implementation**: Creates a new record in the `Suggestion` table and returns its ID.

### Business API

The full contract is defined in `business/api/openapi.yml`. All development must adhere to this contract.

- **`GET /organizations/{orgId}`**: Retrieves details for a specific organization.
    - **Permissions**: Requires a token with `read:organization` permission. User must be a member of `{orgId}`.
- **`PATCH /organizations/{orgId}`**: Updates organization details (e.g., address).
    - **Request Body**: `{ "metadata": { "delivery_address": "123 Main St" } }`
    - **Permissions**: Requires a token with `update:organization` permission. User must be an 'Admin' of `{orgId}`.
- **`GET /jobs`**: Fetches a list of pickup jobs for the user's organization.
    - **Permissions**: Requires a token with `read:pickups` permission.
    - **Implementation**: Lists records from the PickupJob table, filtering by the Company record associated with the
      caller’s auth0_org_id claim.
- **`POST /jobs`**: Creates a new ad-hoc pickup job.
    - **Permissions**: Requires a token with create:pickups permission.
    - **Implementation**: Creates a new record in the PickupJob table with a NULL schedule_id; links the Supplier
      company from the caller’s org.
- **`GET /schedules`**: Fetches the pickup schedules for the user's organization.
    - **Permissions**: Requires a token with read:schedules permission.
    - **Implementation**: Lists records from the PickupSchedule table, filtering by the Company record associated with
      the caller's auth0_org_id.
- **`POST /schedules`**: Creates a new recurring pickup schedule.
    - **Permissions**: Requires a token with update:schedules permission. User must be an 'Admin' of their organization.
- **`PATCH /schedules/{scheduleId}`**: Updates an existing pickup schedule.
    - **Permissions**: Requires a token with update:schedules permission. User must be an 'Admin' of their organization.

## Authorization Model

This section governs how access_token issued by Auth0 is consumed by API and which claims control which API.

Sample access_token. `org_id` is nullable for donors.

```json
{
  "sub": "auth0|123",
  "scope": "read:donations create:payment_intent read:organization update:organization read:pickups create:pickups",
  "org_id": "org_abc123",
  "https://replate.dev/org_role": "admin|member|driver|null",
  "https://replate.dev/donor": true|false
}