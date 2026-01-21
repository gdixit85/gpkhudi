// GitHub API Proxy for Decap CMS
// Uses a server-side GitHub token so users don't need to authenticate

export async function onRequest(context) {
    const { request, env } = context;

    // Get GitHub token from environment
    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
        return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get the GitHub API path from the request params (reliable way)
    // [[path]].js puts the wildcards in context.params.path as an array
    const url = new URL(request.url);
    const pathSegments = context.params.path;

    if (!pathSegments || pathSegments.length === 0) {
        return new Response('Missing API path', { status: 400 });
    }

    const githubPath = pathSegments.join('/');
    const githubUrl = `https://api.github.com/${githubPath}${url.search}`;

    // Forward the request to GitHub API with authentication
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${githubToken}`);
    headers.set('Accept', 'application/vnd.github.v3+json');
    headers.set('User-Agent', 'GP-Khudi-CMS');

    // Remove headers that shouldn't be forwarded
    headers.delete('Host');
    headers.delete('CF-Connecting-IP');
    headers.delete('CF-Ray');

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

    // If error, return details for debugging
    if (!githubResponse.ok) {
        const text = await githubResponse.text();
        return new Response(JSON.stringify({
            error: 'GitHub API Error',
            status: githubResponse.status,
            url: githubUrl,
            github_response: text,
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
}
