const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    const regex = /<a href="contatos\.html"[^>]*>Solicitar Orçamento<\/a>/gi;
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Removed Solicitar Orçamento button from ${f}`);
    }
}
