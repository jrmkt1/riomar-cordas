const fs = require('fs');
const path = require('path');

const files = {
    'expositores.html': { nome: 'Expositores', antigo_nome: 'CORDA<br>TROPICAL', antiga_tag: 'Polipropileno · Multiuso', antiga_title: 'Corda Tropical Riomar' },
    'produto-torcida-branca.html': { nome: 'Torcida Branca', antigo_nome: '(CORDA\\s*<br>\\s*PP)?CORDA\\s*TORCIDA\\s*PP\\s*BRANCA' },
    'produto-pe-azul.html': { nome: 'PE Azul', antigo_nome: 'CORDA\\s*POLIETILENO\\s*\\(PE\\)' },
    'produto-pp-sinalizacao.html': { nome: 'PP Sinalização', antigo_nome: 'CORDA\\s*TORCIDA\\s*PP\\s*BRANCA' },
    'produto-trancada-branca.html': { nome: 'Trançada Branca', antigo_nome: 'CORDA\\s*TRANÇADA' },
    'produto-trancada-carga.html': { nome: 'Trançada Carga', antigo_nome: 'CORDA\\s*TRANÇADA' },
    'produto-trancada-chata.html': { nome: 'Trançada Chata', antigo_nome: 'CORDA\\s*TRANÇADA' },
    'produto-trancada-per.html': { nome: 'Trançada PER', antigo_nome: 'CORDA\\s*POLIETILENO\\s*RECICLADO\\s*\\(PER\\)' },
    'produto-trancada-pet.html': { nome: 'Trançada PET', antigo_nome: 'CORDA\\s*POLIÉSTER\\s*PET\\s*RECICLADO' },
    'distribuicao.html': { nome: 'Distribuição', antigo_nome: 'CORDA<br>TROPICAL' },
};

for (const [file, data] of Object.entries(files)) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    // Super simple replacement to give them the right title
    // Replace <title>
    content = content.replace(/<title>.*?<\/title>/gi, `<title>${data.nome} – Riomar Cordas</title>`);

    // Replace <h1>
    let h1Regex = new RegExp(`<h1 class="produto-hero__title">.*?</h1>`, 'is');
    content = content.replace(h1Regex, `<h1 class="produto-hero__title">${data.nome.toUpperCase().replace(' ', '<br>')}</h1>`);

    // Replace breadcrumb current
    content = content.replace(/<span class="current">.*?<\/span>/s, `<span class="current">${data.nome}</span>`);

    // Replace section title
    let h2Regex = new RegExp(`<h2 class="section-title left">.*?</h2>`, 'is');
    content = content.replace(h2Regex, `<h2 class="section-title left">${data.nome.toUpperCase()}</h2>`);

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Files updated successfully");
