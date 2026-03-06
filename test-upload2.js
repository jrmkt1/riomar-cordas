const fs = require('fs');

async function test() {
    try {
        const tokenRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'riomar_admin', password: 'Riomar@2024' })
        });
        const { token } = await tokenRes.json();
        console.log("Token:", token);

        const form = new FormData();
        form.append('title', 'Teste PUT');

        // Use native Blob
        const buffer = fs.readFileSync('images/logo.png');
        const blob = new Blob([buffer], { type: 'image/png' });
        form.append('image', blob, 'logo.png');

        const res = await fetch('http://localhost:3000/api/products/1', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: form
        });

        const data = await res.json();
        console.log("Update response:", data);

        const prodRes = await (await fetch('http://localhost:3000/api/products')).json();
        console.log("Products: ", prodRes.slice(0, 1));
    } catch (e) {
        console.error("Test failed", e);
    }
}

test();
