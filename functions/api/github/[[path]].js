// GitHub API Proxy for Decap CMS
// Uses a server-side GitHub token so users don't need to authenticate

export async function onRequest(context) {
    try {
        const { request, env } = context;

        // Get GitHub token from environment
        const githubToken = env.GITHUB_TOKEN;

        // Get the GitHub API path from the request params (reliable way)
        // [[path]].js puts the wildcards in context.params.path as an array
        const url = new URL(request.url);
        const pathSegments = context.params.path || [];

        // Health Check / Debugging Endpoint
        // If accessing the root /api/github, return status of the proxy
        if (pathSegments.length === 0) {
            return new Response(JSON.stringify({
                status: 'online',
                service: 'GP Khudi CMS Proxy',
                token_configured: !!githubToken,
                token_prefix: githubToken ? githubToken.substring(0, 15) + '...' : 'none',
                time: new Date().toISOString()
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // For actual logical requests, Token IS required
        if (!githubToken) {
            return new Response(JSON.stringify({ error: 'GitHub token not configured in Cloudflare Pages settings' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Construct GitHub URL
        const githubPath = pathSegments.join('/');
        const githubUrl = `https://api.github.com/${githubPath}${url.search}`;

        // Forward the request to GitHub API with authentication
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${githubToken.trim()}`); // Trim just in case
        headers.set('Accept', 'application/vnd.github.v3+json');
        headers.set('User-Agent', 'GP-Khudi-CMS');

        // Remove headers that shouldn't be forwarded
        headers.delete('Host');
        headers.delete('CF-Connecting-IP');
        headers.delete('CF-Ray');
        headers.delete('Cookie'); // Don't send cookies to GitHub

        const githubResponse = await fetch(githubUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
        });

        // Return the GitHub response
        const responseHeaders = new Headers(githubResponse.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // IMPORTANT: Check for null body status codes FIRST (before error handling)
        // These status codes (204, 304, etc.) are not errors but require special handling
        // 304 Not Modified has response.ok = false, so check this before the error block
        const nullBodyStatuses = [204, 205, 304];

        if (nullBodyStatuses.includes(githubResponse.status)) {
            return new Response(null, {
                status: githubResponse.status,
                headers: responseHeaders
            });
        }

        // If error, return details for debugging
        if (!githubResponse.ok) {
            let errorBody = "";
            try {
                errorBody = await githubResponse.text();
                // Try to parse JSON if possible to return clean object
                try { errorBody = JSON.parse(errorBody); } catch (e) { }
            } catch (e) {
                errorBody = "Could not read error body";
            }

            return new Response(JSON.stringify({
                error: 'GitHub API Error',
                status: githubResponse.status,
                url: githubUrl,
                github_response: errorBody,
                received_path: url.pathname
            }), {
                status: githubResponse.status,
                headers: responseHeaders
            });
        }

        return new Response(githubResponse.body, {
            status: githubResponse.status,
            headers: responseHeaders
        });
    } catch (err) {
        return new Response(JSON.stringify({
            error: 'Proxy Internal Error',
            message: err.message,
            stack: err.stack
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
