const fs = require('fs');

const htmlFile = 'distribuicao.html';
const jsonFile = 'imgs.json';

let html = fs.readFileSync(htmlFile, 'utf8');
const imgs = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// 1. CARRO DE MÃO
html = html.replace('<span class="dist-card__icon">🛒</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'CARRO DE MÃO').img}" alt="CARRO DE MÃO" />`);
// 2. CINTA CATRACA
html = html.replace('<span class="dist-card__icon">⚙️</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'CINTA CATRACA').img}" alt="CINTA CATRACA" />`);
// 3. Corda K2
html = html.replace('<span class="dist-card__icon">🧗</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Corda K2').img}" alt="Corda K2" />`);
// 4. Corda Poliamida
html = html.replace('<span class="dist-card__icon">🪢</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Corda Poliamida').img}" alt="Corda Poliamida" />`);
// 5. FILME AGRÍCOLA (Lona Preta)
html = html.replace('<span class="dist-card__icon">⬛</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'FILME AGRÍCOLA (Lona Preta)').img}" alt="FILME AGRÍCOLA (Lona Preta)" />`);
// 6. Filme Agrícola Preto com Branco
html = html.replace('<span class="dist-card__icon">🔲</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Filme Agrícola Preto com Branco').img}" alt="Filme Agrícola Preto com Branco" />`);
// 7. Filme Polietileno Cores
html = html.replace('<span class="dist-card__icon">🎨</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Filme Polietileno Cores').img}" alt="Filme Polietileno Cores" />`);

// 8. Fio de Nylon para Roçadeira - URL missed in scrape? I check the JSON.
const fioNylonImg = imgs.find(i => i.name === 'Fio de Nylon para Roçadeira').img || "https://www.riomarcordas.com.br/wp-content/uploads/2019/10/fio_nylon.jpg";
html = html.replace('<span class="dist-card__icon">🌿</span>', `<img class="dist-card__img" src="${fioNylonImg}" alt="Fio de Nylon" />`);

// 9. Fitilho Reciclado
html = html.replace('<span class="dist-card__icon">♻️</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Fitilho Reciclado').img}" alt="Fitilho Reciclado" />`);

// 10. Lona Multiuso Azul
html = html.replace('<span class="dist-card__icon">🟦</span>', `<img class="dist-card__img" src="${imgs.find(i => i.name === 'Lona Multiuso Azul').img}" alt="Lona Multiuso Azul" />`);


// Add CSS for dist-card__img
const cssOld = `
        .dist-card__icon {
            font-size: 4rem;
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.05));
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .dist-card:hover .dist-card__icon {
            transform: scale(1.15) rotate(5deg);
        }
`;

const cssNew = `
        .dist-card__img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .dist-card:hover .dist-card__img {
            transform: scale(1.08);
        }
`;
html = html.replace(cssOld, cssNew);


// To remove padding on dist-card__icon-wrap for imgs
html = html.replace(/\.dist-card__icon-wrap {[\s\S]*?}/, `.dist-card__icon-wrap {
            height: 200px;
            background: var(--gray-100);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid var(--gray-100);
        }`);

fs.writeFileSync(htmlFile, html);
console.log("Images applied");
