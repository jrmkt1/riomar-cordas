const cheerio = require('cheerio');
const fs = require('fs');

const categoryUrls = [
    { id: 'produto-torcida-branca', url: 'https://www.riomarcordas.com.br/index.php/produto/torcida-branca-rolo/' },
    { id: 'produto-torcida-branca', url: 'https://www.riomarcordas.com.br/index.php/produto/torcida-branca-carretel/' },
    { id: 'produto-pe-azul', url: 'https://www.riomarcordas.com.br/index.php/produto/pe-azul-rolo/' },
    { id: 'produto-pe-azul', url: 'https://www.riomarcordas.com.br/index.php/produto/pe-azul-carretel/' },
    { id: 'produto-trancada-pet', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-pet-rolo/' },
    { id: 'produto-trancada-pet', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-pet-carretel/' }
];

async function scrapeDeep() {
    const scraped = JSON.parse(fs.readFileSync('riomar-scraped.json', 'utf8'));

    for (const item of categoryUrls) {
        console.log(`Deep Scraping ${item.url}...`);
        try {
            const res = await fetch(item.url);
            if (res.status !== 200) continue;

            const html = await res.text();
            const $ = cheerio.load(html);

            const title = $('h1.product_title').text().trim();
            const shortDesc = $('.woocommerce-product-details__short-description').html() || '';
            const textDescription = $('#tab-description').text().trim();
            const imageUrl = $('.woocommerce-product-gallery__image img').first().attr('src') || '';

            const tables = [];
            $('table').each((i, table) => {
                const headers = [];
                $(table).find('th, thead td').each((j, th) => headers.push($(th).text().trim()));

                const rows = [];
                $(table).find('tbody tr').each((j, tr) => {
                    const cells = [];
                    $(tr).find('td').each((k, td) => cells.push($(td).text().trim()));
                    if (cells.length > 0) rows.push(cells);
                });

                if (headers.length === 0 && rows.length > 0) {
                    headers.push(...rows[0]);
                    rows.shift();
                }
                tables.push({ headers, rows });
            });

            // Find the category block
            const cat = scraped.find(s => s.id === item.id);
            if (cat) {
                if (!cat.products) cat.products = [];
                cat.products.push({
                    title,
                    subtitle: shortDesc.trim(),
                    textDescription,
                    imageUrl,
                    tables
                });
                // Also grab the image for the main page if none
                if (cat.imageUrl.includes('data:image')) cat.imageUrl = imageUrl;
            }

        } catch (e) {
            console.error(`Error fetching ${item.url}:`, e);
        }
    }

    fs.writeFileSync('riomar-scraped.json', JSON.stringify(scraped, null, 2));
    console.log("Deep scraping finished, updated riomar-scraped.json");
}

scrapeDeep();
