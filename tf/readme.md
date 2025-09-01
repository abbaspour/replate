# Project Terraform



## Terraform Client 
### Auth0
- Create private key
  ```bash
    make generate-keys
  ```
- In manage.auth0.com of your tenant, create an M2M client for Terraform with full API2 access.
- Set Terraform client to JWT-CA and upload `terraform-jwt-ca-public.pem` from step 1.
- Copy and populate
  ```bash
  cp terraform.auto.tfvars-sample terraform.auto.tfvars
  vi terraform.auto.tfvars
  ```
### HubSpot
Go to HubSpot > Settings (gear icon on top right) > Integration > Connected Apps
Create an app for Terraform with following scopes

crm.objects.companies.read
crm.objects.companies.write
crm.objects.contacts.read
crm.objects.contacts.write
crm.schemas.companies.read
crm.schemas.companies.write
crm.schemas.contacts.read
crm.schemas.contacts.write
crm.schemas.custom.read
crm.schemas.custom.write

## Execution 
- Init & plan and apply
  ```bash
  make init
  make
  make apply
  ```


