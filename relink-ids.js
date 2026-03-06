const fs = require('fs');

const mappings = {
    'expositores.html': 1,
    'produto-tropical.html': 2,
    'produto-meadas.html': 3,
    'produto-torcida-branca.html': 4,
    'produto-pe-azul.html': 5,
    'produto-pp-sinalizacao.html': 6,
    'produto-trancada.html': 7,
    'produto-trancada-branca.html': 8,
    'produto-trancada-carga.html': 9,
    'produto-trancada-chata.html': 10,
    'produto-trancada-per.html': 11,
    'produto-trancada-pet.html': 12,
    'distribuicao.html': 13
};

for (const [file, dbId] of Object.entries(mappings)) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace hardcoded id === 1 or 2 with the correct ID for this page
    content = content.replace(/p => p\.id === \d+/, `p => p.id === ${dbId}`);

    // Also fix the comment for clarity
    content = content.replace(/\/\/ Procura pelo produto de ID \d+ .*? banco de dados/g, `// Procura pelo produto de ID ${dbId} no banco de dados`);

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Linked ${file} to Admin DB ID ${dbId}`);
}
