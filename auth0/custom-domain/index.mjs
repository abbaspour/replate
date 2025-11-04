/*
 * Copyright 2025 Auth0 Product Architecture Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
        // Handle CORS preflight for /me/ resources locally and do not proxy upstream
        if (request.method === 'OPTIONS' && url.pathname.startsWith('/me/')) {
            const origin = request.headers.get('Origin') || '*';
            const reqHeaders = request.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization';
            const headers = new Headers({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': reqHeaders,
                'Access-Control-Max-Age': '86400',
                'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
            });
            return new Response(null, { status: 204, headers });
        }
        */


        url.hostname = env.AUTH0_EDGE_LOCATION;

        const newRequest = new Request(url, request);
        newRequest.headers.set('cname-api-key', env.CNAME_API_KEY);

        return await fetch(newRequest);
    }
}