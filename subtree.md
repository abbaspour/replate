# OIDC Bash
```bash
git remote add oidc-bash https://github.com/abbaspour/oidc-bash.git
git subtree add --prefix=agent/oidc-bash oidc-bash main --squash
git commit -m "Add 'oidc-bash' as a subtree into agent/oidc-bash"

git subtree pull --prefix=agent/oidc-bash oidc-bash main --squash
```

# Auth0 MyAccount Bash
```bash
git remote add auth0-myaccount-bash https://github.com/abbaspour/auth0-myaccount-bash.git
git subtree add --prefix=agent/auth0-myaccount-bash auth0-myaccount-bash main --squash
git commit -m "Add 'auth0-myaccount-bash' as a subtree into agent/auth0-myaccount-bash"

git subtree pull --prefix=agent/auth0-myaccount-bash auth0-myaccount-bash main --squash
```