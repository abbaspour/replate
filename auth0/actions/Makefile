all: dist/silent-account-linking.js dist/post-login-claims.js dist/render-privacy-policy-form.js dist/mfa-when-enrolled.js

dist/%.js: %.ts
	npm run build

clean:
	rm -rf ./dist

.PHONY: clean


