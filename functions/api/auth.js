export async function onRequest(context) {
    // Return a dummy token to satisfy Decap CMS
    // The real authentication happens server-side with the PIN middleware and Proxy

    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            // Send the dummy token back to the CMS
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token: 'dummy-token-for-proxy-access', provider: 'github' })}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          // Start the handshake
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `;

    return new Response(script, {
        headers: { 'Content-Type': 'text/html' },
    });
}
