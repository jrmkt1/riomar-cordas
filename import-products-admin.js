const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const dropdownItems = [
    { href: 'expositores.html', label: 'Expositores', img: 'images/menu-thumbs/thumb-expositores.jpg' },
    { href: 'produto-tropical.html', label: 'Corda Tropical', img: 'images/menu-thumbs/thumb-tropical.jpg' },
    { href: 'produto-meadas.html', label: 'Meadas', img: 'images/menu-thumbs/thumb-meadas.jpg' },
    { href: 'produto-torcida-branca.html', label: 'Torcida Branca', img: 'images/menu-thumbs/thumb-torcida-branca.jpg' },
    { href: 'produto-pe-azul.html', label: 'PE Azul', img: 'images/menu-thumbs/thumb-pe-azul.jpg' },
    { href: 'produto-pp-sinalizacao.html', label: 'PP Sinalização', img: 'images/menu-thumbs/thumb-pp-sinaliza--o.jpg' },
    { href: 'produto-trancada.html', label: 'Trançada', img: 'images/menu-thumbs/thumb-tran-ada.jpg' },
    { href: 'produto-trancada-branca.html', label: 'Trançada Branca', img: 'images/menu-thumbs/thumb-tran-ada-branca.jpg' },
    { href: 'produto-trancada-carga.html', label: 'Trançada Carga', img: 'images/menu-thumbs/thumb-tran-ada-carga.jpg' },
    { href: 'produto-trancada-chata.html', label: 'Trançada Chata', img: 'images/menu-thumbs/thumb-tran-ada-chata.jpg' },
    { href: 'produto-trancada-per.html', label: 'Trançada PER', img: 'images/menu-thumbs/thumb-tran-ada-per.jpg' },
    { href: 'produto-trancada-pet.html', label: 'Trançada PET', img: 'images/menu-thumbs/thumb-trancada-pet.jpg' },
    { href: 'distribuicao.html', label: 'Distribuição', img: 'images/menu-thumbs/thumb-distribuicao.jpg' },
];

db.serialize(() => {
    // Apaga todos os produtos antigos
    db.run("DELETE FROM products", function (err) {
        if (err) return console.error("Erro ao apagar produtos antigos:", err.message);
        console.log(`Foram removidos ${this.changes} produtos antigos.`);

        // Reseta o autoincrement
        db.run("DELETE FROM sqlite_sequence WHERE name='products'");

        const stmt = db.prepare("INSERT INTO products (title, tag, description, tags, image_url) VALUES (?, ?, ?, ?, ?)");

        let count = 0;
        dropdownItems.forEach((item) => {
            const desc = `Produto ${item.label} da linha Riomar Cordas.`;
            const tags = JSON.stringify([item.label]);

            stmt.run([item.label, 'Riomar', desc, tags, item.img], function (err) {
                if (err) {
                    console.error("Erro ao inserir:", err.message);
                } else {
                    count++;
                }
            });
        });

        stmt.finalize(() => {
            console.log(`Importação concluída: ${count} novos produtos cadastrados no Admin.`);
            db.close();
        });
    });
});
