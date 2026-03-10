const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conecta ao arquivo do banco de dados (que será criado se não existir)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initDB();
    }
});

function initDB() {
    db.serialize(() => {
        // Tabela de Usuários Administrativos
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);

        // Tabela de Representantes
        db.run(`CREATE TABLE IF NOT EXISTS representatives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            region TEXT NOT NULL,
            states TEXT NOT NULL, -- Ex: "SC", "SP,RJ" 
            phone TEXT,
            email TEXT,
            whatsapp TEXT
        )`);

        // Tabela de Produtos
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            tag TEXT,
            description TEXT,
            tags TEXT, -- JSON Array ou comma-separated
            image_url TEXT,
            bitolas TEXT,
            cores TEXT,
            metragens TEXT,
            cargas_ruptura TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabela de Especificações dos Produtos (Metragens, tipos, etc)
        db.run(`CREATE TABLE IF NOT EXISTS product_specs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            spec_data TEXT, -- JSON Object com os dados das colunas (Ex: { "Bitola": "8mm", "Tipo": "Trançada" })
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`);

        // Tabela de Solicitações de Orçamentos
        db.run(`CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_whatsapp TEXT NOT NULL,
            customer_email TEXT,
            items_json TEXT NOT NULL, -- JSON Array
            status TEXT DEFAULT 'Pendente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Criar usuário admin padrão caso não exista (credenciais via .env)
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            console.warn('ADMIN_USERNAME/ADMIN_PASSWORD nao configurados; criacao automatica de admin desativada.');
            return;
        }

        db.get("SELECT id FROM users WHERE username = ?", [ADMIN_USERNAME], (err, row) => {
            if (!row) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(ADMIN_PASSWORD, salt);
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [ADMIN_USERNAME, hash]);
                console.log(`Admin inicial criado: ${ADMIN_USERNAME}`);
            }
        });
    });
}

module.exports = db;
