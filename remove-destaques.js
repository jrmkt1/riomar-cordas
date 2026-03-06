const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    const regex = /<section class="produto-destaques"[\s\S]*?<\/section>/gi;
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Removed produto-destaques from ${f}`);
    }
}
