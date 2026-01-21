// PIN-based authentication middleware for /admin/*
// Protects the CMS with a simple PIN code

const LOGIN_HTML = `
<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>लॉगिन | खुडी ग्रामपंचायत</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        }
        .login-card {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .logo { font-size: 48px; margin-bottom: 16px; }
        h1 { color: #1e3c72; font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .pin-input {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .pin-input input {
            width: 50px;
            height: 60px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            border: 2px solid #ddd;
            border-radius: 12px;
            outline: none;
            transition: border-color 0.3s;
        }
        .pin-input input:focus {
            border-color: #1e3c72;
        }
        button {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            border: none;
            padding: 14px 48px;
            font-size: 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(30, 60, 114, 0.4);
        }
        .error {
            color: #dc3545;
            margin-top: 16px;
            display: none;
        }
        .error.show { display: block; }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">🏛️</div>
        <h1>व्यवस्थापन पॅनेल</h1>
        <p class="subtitle">खुडी ग्रामपंचायत</p>
        <form method="POST" id="pinForm">
            <div class="pin-input">
                <input type="password" maxlength="1" pattern="[0-9]" inputmode="numeric" required autofocus>
                <input type="password" maxlength="1" pattern="[0-9]" inputmode="numeric" required>
                <input type="password" maxlength="1" pattern="[0-9]" inputmode="numeric" required>
                <input type="password" maxlength="1" pattern="[0-9]" inputmode="numeric" required>
            </div>
            <input type="hidden" name="pin" id="hiddenPin">
            <button type="submit">प्रवेश करा</button>
            <p class="error" id="error">❌ चुकीचा पिन</p>
        </form>
    </div>
    <script>
        const inputs = document.querySelectorAll('.pin-input input');
        const hiddenPin = document.getElementById('hiddenPin');
        const form = document.getElementById('pinForm');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let pin = '';
            inputs.forEach(input => pin += input.value);
            hiddenPin.value = pin;
            form.submit();
        });
        
        // Show error if URL has error param
        if (window.location.search.includes('error=1')) {
            document.getElementById('error').classList.add('show');
        }
    </script>
</body>
</html>
`;

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Get the PIN from environment variable
    const correctPin = env.ADMIN_PIN || '1234';

    // Check if user has valid session cookie
    const cookies = request.headers.get('Cookie') || '';
    const sessionMatch = cookies.match(/admin_session=([^;]+)/);

    if (sessionMatch) {
        const sessionToken = sessionMatch[1];
        // Simple validation: token should match a hash of the PIN
        const expectedToken = await hashPin(correctPin);
        if (sessionToken === expectedToken) {
            // Valid session, allow access
            return context.next();
        }
    }

    // Handle POST (login attempt)
    if (request.method === 'POST') {
        const formData = await request.formData();
        const submittedPin = formData.get('pin');

        if (submittedPin === correctPin) {
            // Correct PIN - set session cookie and redirect
            const sessionToken = await hashPin(correctPin);
            const response = new Response(null, {
                status: 302,
                headers: {
                    'Location': url.pathname,
                    'Set-Cookie': `admin_session=${sessionToken}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
                }
            });
            return response;
        } else {
            // Wrong PIN - show login with error
            return new Response(LOGIN_HTML.replace('display: none', 'display: block'), {
                headers: { 'Content-Type': 'text/html' }
            });
        }
    }

    // Show login page
    return new Response(LOGIN_HTML, {
        headers: { 'Content-Type': 'text/html' }
    });
}

async function hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'gpkhudi-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
