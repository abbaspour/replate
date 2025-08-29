# Setup

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
- Init & plan and apply
  ```bash
  make init
  make
  make apply
  ```


