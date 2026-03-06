const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
    const tokenRes = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'riomar_admin', password: 'Riomar@2024' })
    });
    const { token } = await tokenRes.json();
    console.log("Token:", token);

    const form = new FormData();
    form.append('title', 'Teste PUT');
    form.append('image', fs.createReadStream('images/logo.png'));

    const res = await fetch('http://localhost:3000/api/products/1', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            ...form.getHeaders()
        },
        body: form
    });

    const data = await res.json();
    console.log("Update response:", data);
}

test().catch(console.error);
