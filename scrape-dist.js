const fs = require('fs');
const cheerio = require('cheerio');

const urls = [
    { name: "CARRO DE MÃO", url: "https://www.riomarcordas.com.br/index.php/produto/carro-de-mao/" },
    { name: "CINTA CATRACA", url: "https://www.riomarcordas.com.br/index.php/produto/cinta-catraca/" },
    { name: "Corda K2", url: "https://www.riomarcordas.com.br/index.php/produto/corda-k2/" },
    { name: "Corda Poliamida", url: "https://www.riomarcordas.com.br/index.php/produto/corda-poliamida/" },
    { name: "FILME AGRÍCOLA (Lona Preta)", url: "https://www.riomarcordas.com.br/index.php/produto/filme-agricola-lona-preta/" },
    { name: "Filme Agrícola Preto com Branco", url: "https://www.riomarcordas.com.br/index.php/produto/filme-agricola-preto-com-branco/" },
    { name: "Filme Polietileno Cores", url: "https://www.riomarcordas.com.br/index.php/produto/filme-polietileno-cores/" },
    { name: "Fio de Nylon para Roçadeira", url: "https://www.riomarcordas.com.br/index.php/produto/fio-de-nylon-para-rocadeira/" },
    { name: "Fitilho Reciclado", url: "https://www.riomarcordas.com.br/index.php/produto/fitilho-reciclado/" },
    { name: "Lona Multiuso Azul", url: "https://www.riomarcordas.com.br/index.php/produto/lona-multiuso-azul/" }
];

async function scrape() {
    const results = [];
    for (const item of urls) {
        try {
            const res = await fetch(item.url);
            const html = await res.text();
            const $ = cheerio.load(html);
            let imgUrl = $('meta[property="og:image"]').attr('content');
            if (!imgUrl) {
                imgUrl = $('.woocommerce-product-gallery__image img').attr('src');
            }
            results.push({ name: item.name, img: imgUrl });
            console.log(`Fetched ${item.name}`);
        } catch (e) {
            console.error(`Error ${item.name}: ${e.message}`);
        }
    }
    fs.writeFileSync('imgs.json', JSON.stringify(results, null, 2));
}

scrape();
