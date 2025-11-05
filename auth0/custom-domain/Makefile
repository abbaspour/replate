# Copyright 2025 Auth0 Product Architecture Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

publish: deploy

SECRETS_FILE = '.env'
SECRETS_FILE_UK = '.env-uk'

deploy:
	wrangler deploy

deploy-uk:
	wrangler -c wrangler-uk.toml deploy

log:
	wrangler tail

log-uk:
	wrangler  -c wrangler-uk.toml tail

update-cf-secrets:
	npx wrangler secret bulk $(SECRETS_FILE)
	npx wrangler -c wrangler-uk.toml secret bulk $(SECRETS_FILE_UK)
