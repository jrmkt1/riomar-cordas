const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'produto-tropical.html', 'produto-meadas.html', 'produto-torcida-branca.html',
    'produto-pe-azul.html', 'produto-pp-sinalizacao.html', 'produto-trancada.html',
    'produto-trancada-branca.html', 'produto-trancada-carga.html', 'produto-trancada-chata.html',
    'produto-trancada-per.html', 'produto-trancada-pet.html', 'distribuicao.html', 'expositores.html'
];

const scraped = JSON.parse(fs.readFileSync('riomar-scraped.json', 'utf8'));

function buildTableHTML(tableObj) {
    if (!tableObj || !tableObj.headers || tableObj.headers.length === 0) return '';
    let html = `
      <table class="specs-table">
          <thead>
              <tr>
                  ${tableObj.headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
          </thead>
          <tbody>
              ${tableObj.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('\\n')}
          </tbody>
      </table>
    `;
    return html;
}

for (const file of filesToUpdate) {
    const id = file.replace('.html', '');
    const data = scraped.find(s => s.id === id);
    if (!data) continue;

    let content = fs.readFileSync(file, 'utf8');

    // Remove empty variations if they exist to rebuild properly
    // The main table is usually the first table that has more than 2 headers, or the first table.
    let productsList = data.products && data.products.length > 0 ? data.products : [data];

    let specsHtml = '';
    let descHtml = '';

    for (const prod of productsList) {
        let textDesc = prod.textDescription || prod.subtitle || '';
        if (textDesc.includes('CORES DISPONÍVEIS:')) {
            textDesc = textDesc.replace('CORES DISPONÍVEIS:', '<br><br><strong>CORES DISPONÍVEIS:</strong>');
        } else if (textDesc.includes('Cores Disponíveis:')) {
            textDesc = textDesc.replace('Cores Disponíveis:', '<br><br><strong>Cores Disponíveis:</strong>');
        }

        descHtml += `
            ${prod.title ? `<h3 style="margin-top: 15px; color: var(--blue-mid);">${prod.title}</h3>` : ''}
            <p style="white-space: pre-wrap; margin-bottom: 20px;">${textDesc}</p>
        `;

        // Generate Tables
        let mainTable = prod.tables ? prod.tables[0] : null;
        if (mainTable) {
            specsHtml += `
            <div class="specs-card" style="margin-bottom: 30px;">
                <h3>Tabela de Especificações${prod.title ? ' - ' + prod.title : ''}</h3>
                <div class="table-responsive">
                    ${buildTableHTML(mainTable)}
                </div>
            </div>`;
        }
    }

    // Now inject description
    const descRegex = /(<div class="produto-desc">)[\s\S]*?(<\/div>)/;
    if (descRegex.test(content) && descHtml.trim() !== '') {
        content = content.replace(descRegex, `$1\\n${descHtml}\\n$2`);
    }

    // Inject specs
    const specsRegex = /<div class="specs-card">[\s\S]*?<\/table>[\s\S]*?<\/div>/;
    if (specsRegex.test(content) && specsHtml.trim() !== '') {
        // If there are multiple new spec cards generated, we replace the single old one with all of them
        content = content.replace(specsRegex, specsHtml.trim());
    } else if (specsHtml.trim() !== '' && !specsRegex.test(content)) {
        // If there was no specs card in the template (because it was newly cloned), insert it before closing wrapper
        content = content.replace(/(<\/div>\s*<\/div>\s*<\/section>)/, `\\n${specsHtml}\\n$1`);
    }

    // Try finding the image to update if a scraped one exists
    let imgToUse = data.imageUrl;
    // Special fix for empty base64 or missing images (use original placeholder if we missing)
    if (imgToUse && !imgToUse.startsWith('data:')) {
        // Just keeping existing images for now to not break layout, since we already downloaded high-res thumbnails
        // but wait, we want the product page image to map properly!
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
}
