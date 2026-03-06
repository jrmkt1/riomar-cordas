const fs = require('fs');
const path = require('path');
const https = require('https');

const links = [
    { href: 'expositores.html', label: 'Expositores', url: 'https://www.riomarcordas.com.br/index.php/expositores-2/' },
    { href: 'produto-tropical.html', label: 'Tropical', url: 'https://www.riomarcordas.com.br/index.php/produto/corda-tropical-riomar/' },
    { href: 'produto-meadas.html', label: 'Meadas', url: 'https://www.riomarcordas.com.br/index.php/produto/cordas-meadas/' },
    { href: 'produto-torcida-branca.html', label: 'Torcida Branca', url: 'https://www.riomarcordas.com.br/index.php/product-category/torcida-branca/' },
    { href: 'produto-pe-azul.html', label: 'PE Azul', url: 'https://www.riomarcordas.com.br/index.php/product-category/pe_azul/' },
    { href: 'produto-pp-sinalizacao.html', label: 'PP Sinalização', url: 'https://www.riomarcordas.com.br/index.php/produto/torcida-pp-sinalizacao/' },
    { href: 'produto-trancada.html', label: 'Trançada', url: 'https://www.riomarcordas.com.br/index.php/produto/corda-trancada-riomar/' },
    { href: 'produto-trancada-branca.html', label: 'Trançada Branca', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-branca/' },
    { href: 'produto-trancada-carga.html', label: 'Trançada Carga', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-carga/' },
    { href: 'produto-trancada-chata.html', label: 'Trançada Chata', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-chata/' },
    { href: 'produto-trancada-per.html', label: 'Trançada PER', url: 'https://www.riomarcordas.com.br/index.php/produto/trancada-per/' },
    { href: 'produto-trancada-pet.html', label: 'Trançada PET', url: 'https://www.riomarcordas.com.br/index.php/product-category/trancada-pet/' },
    { href: 'distribuicao.html', label: 'Distribuição', url: 'https://www.riomarcordas.com.br/index.php/product-category/distribuicao/' }
];

async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(filename);
            reject(err);
        });
    });
}

async function scrape() {
    const imagesDir = path.join(__dirname, 'images', 'menu-thumbs');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    let javascriptOutput = "const dropdownItems = [\n";

    for (const link of links) {
        let imgSrc = null;
        try {
            const html = await fetchHtml(link.url);

            // Extract the featured product image or category image from HTML
            // Typically inside <div class="woocommerce-product-gallery__image"> or similar
            const match = html.match(/<img[^>]+src="([^">]+\.(jpg|png|webp))"[^>]*class="(?:wp-post-image|attachment-woocommerce_thumbnail)[^>]*"/i);

            if (match && match[1]) {
                const imgUrl = match[1];
                const ext = path.extname(imgUrl.split('?')[0]);
                const filename = `thumb-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}${ext}`;
                const filepath = path.join(imagesDir, filename);

                if (!fs.existsSync(filepath)) {
                    console.log(`Downloading ${imgUrl} to ${filename}`);
                    await downloadImage(imgUrl, filepath);
                }
                imgSrc = `images/menu-thumbs/${filename}`;
            }
        } catch (e) {
            console.error(`Failed to fetch for ${link.label}: ${e.message}`);
        }

        javascriptOutput += `  { href: '${link.href}', label: '${link.label}', img: ${imgSrc ? `'${imgSrc}'` : 'null'} },\n`;
    }

    javascriptOutput += "];";
    fs.writeFileSync('dropdown-items.txt', javascriptOutput);
    console.log("Done generating dropdown items");
}

scrape();
