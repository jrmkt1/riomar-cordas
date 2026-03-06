const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const title = 'CORDA TROPICAL';
const tag = 'Polipropileno · Multiuso';
const description = 'Polipropileno trançada 100% virgem em carretel. Colorida, resistente e versátil. A escolha mais popular do mercado para uso doméstico, agropecuária e revenda.';
const tags = '["Polipropileno"]';
const imageUrl = 'images/rope_pp.png';

db.run(
    "UPDATE products SET title=?, tag=?, description=?, tags=?, image_url=? WHERE id=?",
    [title, tag, description, tags, imageUrl, 1],
    function (err) {
        if (err) console.error("Restore err:", err.message);
        else console.log("Restored rows:", this.changes);
    }
);
