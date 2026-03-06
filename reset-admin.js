/**
 * reset-admin.js
 * Apaga o usuário admin antigo e cria um novo com as credenciais do .env
 * Uso: node reset-admin.js
 */
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'riomar_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Riomar@2024';

db.serialize(() => {
    // Apaga todos os usuários existentes
    db.run("DELETE FROM users", [], (err) => {
        if (err) {
            console.error('Erro ao limpar usuários:', err.message);
            return;
        }

        // Cria o usuário novo com hash bcrypt
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

        db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [ADMIN_USERNAME, hash],
            (err2) => {
                if (err2) {
                    console.error('Erro ao criar usuário:', err2.message);
                } else {
                    console.log('✅ Credenciais do Admin atualizadas com sucesso!');
                    console.log(`   Usuário : ${ADMIN_USERNAME}`);
                    console.log(`   Senha   : ${ADMIN_PASSWORD}`);
                }
                db.close();
            }
        );
    });
});
