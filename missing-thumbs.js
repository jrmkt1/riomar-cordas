const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = {
    'thumb-expositores.jpg': 'https://www.riomarcordas.com.br/wp-content/uploads/2021/04/expositores.jpg',
    'thumb-torcida-branca.jpg': 'https://www.riomarcordas.com.br/wp-content/uploads/2019/08/branca-600x400.jpg',
    'thumb-pe-azul.jpg': 'https://www.riomarcordas.com.br/wp-content/uploads/2019/08/pe_azul-600x400.jpg',
    'thumb-trancada-pet.jpg': 'https://www.riomarcordas.com.br/wp-content/uploads/2019/08/trancada_pet-600x400.jpg',
    'thumb-distribuicao.jpg': 'https://www.riomarcordas.com.br/wp-content/uploads/2019/08/corda-bombero-1-600x400.jpg'
};

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

(async () => {
    for (const [name, url] of Object.entries(urls)) {
        await downloadImage(url, path.join(__dirname, 'images', 'menu-thumbs', name));
    }
    console.log("Done missing images.");
})();
