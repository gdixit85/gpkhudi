// Cloudflare Pages Function for Decap CMS GitHub OAuth
// Based on: https://decapcms.org/docs/external-oauth-clients/

const OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const OAUTH_SCOPES = 'repo,user';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Get OAuth credentials from environment variables
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured', { status: 500 });
  }

  // Step 1: Redirect to GitHub for authorization
  if (!url.searchParams.has('code')) {
    const authUrl = new URL(OAUTH_AUTHORIZE_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', url.origin + url.pathname);
    authUrl.searchParams.set('scope', OAUTH_SCOPES);
    authUrl.searchParams.set('state', crypto.randomUUID());
    
    return Response.redirect(authUrl.toString(), 302);
  }
  
  // Step 2: Exchange code for access token
  const code = url.searchParams.get('code');
  
  const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  
  if (tokenData.error) {
    return new Response(`Error: ${tokenData.error_description}`, { status: 400 });
  }
  
  // Step 3: Return token to Decap CMS
  const script = `
    <script>
      (function() {
        function recieveMessage(e) {
          console.log("recieveMessage %o", e);
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}',
            e.origin
          );
          window.removeEventListener("message", recieveMessage, false);
        }
        window.addEventListener("message", recieveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  `;
  
  return new Response(script, {
    headers: { 'Content-Type': 'text/html' },
  });
}
