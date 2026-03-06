const cheerio = require('cheerio');
const fs = require('fs');

const links = [
    { id: 'expositores', url: 'https://www.riomarcordas.com.br/index.php/expositores-2/' },
    { id: 'produto-tropical', url: 'https://www.riomarcordas.com.br/index.php/produto/corda-tropical-riomar/' },
    { id: 'produto-meadas', url: 'https://www.riomarcordas.com.br/index.php/produto/cordas-meadas/' },
    { id: 'produto-torcida-branca', url: 'https://www.riomarcordas.com.br/index.php/product-category/torcida-branca/' },
    { id: 'produto-pe-azul', url: 'https://www.riomarcordas.com.br/index.php/product-category/pe_azul/' },
    { id: 'produto-pp-sinalizacao', url: 'https://www.riomarcordas.com.br/index.php/produto/torcida-pp-sinalizacao/' },
    { id: 'produto-trancada', url: 'https://www.riomarcordas.com.br/index.php/produto/corda-trancada-riomar/' },
    { id: 'produto-trancada-branca', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-branca/' },
    { id: 'produto-trancada-carga', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-carga/' },
    { id: 'produto-trancada-chata', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-chata/' },
    { id: 'produto-trancada-per', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-per/' },
    { id: 'produto-trancada-pet', url: 'https://www.riomarcordas.com.br/index.php/product-category/trancada-pet/' },
    { id: 'distribuicao', url: 'https://www.riomarcordas.com.br/index.php/product-category/distribuicao/' }
];

async function scrapeData() {
    const results = [];
    for (const item of links) {
        console.log(`Scraping ${item.url}...`);
        try {
            const res = await fetch(item.url);
            const html = await res.text();
            const $ = cheerio.load(html);

            let title = '';
            let subtitle = '';
            let isCategory = item.url.includes('/product-category/');

            if (isCategory) {
                title = $('.woocommerce-products-header__title, .page-title').text().trim();
                const descHtml = $('.term-description').html();
                subtitle = descHtml ? descHtml.trim() : '';
            } else {
                title = $('h1.product_title').text().trim();
                const shortDesc = $('.woocommerce-product-details__short-description').html();
                subtitle = shortDesc ? shortDesc.trim() : '';
            }

            // Get main image
            let imageUrl = '';
            if (isCategory) {
                imageUrl = $('.term-description img, .woocommerce-products-header img').attr('src') || '';
                if (!imageUrl) {
                    imageUrl = $('img.attachment-woocommerce_thumbnail').first().attr('src') || '';
                }
            } else {
                imageUrl = $('.woocommerce-product-gallery__image img').first().attr('src') || '';
            }

            // Get tables
            const tables = [];
            $('table').each((i, table) => {
                const headers = [];
                $(table).find('th, thead td').each((j, th) => {
                    headers.push($(th).text().trim());
                });

                const rows = [];
                $(table).find('tbody tr').each((j, tr) => {
                    const cells = [];
                    $(tr).find('td').each((k, td) => {
                        cells.push($(td).text().trim());
                    });
                    if (cells.length > 0) {
                        rows.push(cells);
                    }
                });

                // Some tables do not have <thead> or <th>. They use the first tr as header usually.
                if (headers.length === 0 && rows.length > 0) {
                    headers.push(...rows[0]);
                    rows.shift();
                }

                tables.push({ headers, rows });
            });

            // If no clean table, grab regular text from description (sometimes they use lists)
            let textDescription = '';
            if (!isCategory) {
                textDescription = $('#tab-description').text().trim();
                // Try to parse variation texts if any
                const formJson = $('form.cart').attr('data-product_variations');
                if (formJson) {
                    try {
                        const vars = JSON.parse(formJson);
                        // We can extract bitolas/cores from variations if available
                    } catch (e) { }
                }
            } else {
                textDescription = $('.term-description').text().trim();
            }

            results.push({
                id: item.id,
                url: item.url,
                title,
                subtitle,
                textDescription,
                imageUrl,
                tables
            });
        } catch (e) {
            console.error(`Error fetching ${item.url}:`, e);
        }
    }

    fs.writeFileSync('riomar-scraped.json', JSON.stringify(results, null, 2));
    console.log("Scraping finished, saved to riomar-scraped.json");
}

scrapeData();
