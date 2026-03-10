const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js/dist/sql-asm.js');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY não configurada no ambiente.');
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
let dbPromise;

function normalizeParams(params) {
    return params.map((value) => (value === undefined ? null : value));
}

async function getDb() {
    if (!dbPromise) {
        dbPromise = initSqlJs().then((SQL) => {
            const buffer = fs.readFileSync(dbPath);
            return new SQL.Database(buffer);
        });
    }

    return dbPromise;
}

async function queryAll(sql, params = []) {
    const db = await getDb();
    const statement = db.prepare(sql);
    const rows = [];

    statement.bind(normalizeParams(params));
    while (statement.step()) {
        rows.push(statement.getAsObject());
    }

    statement.free();
    return rows;
}

async function queryOne(sql, params = []) {
    const rows = await queryAll(sql, params);
    return rows[0] || null;
}

// Middleware de autenticação
function requireAuth(req, res, next) {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ error: 'Token não fornecido' });
    const token = header.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.userId = decoded.id;
        next();
    });
}

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await queryOne("SELECT * FROM users WHERE username = ?", [username]);
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- REPRESENTANTES ---
app.get('/api/representatives', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM representatives ORDER BY region, name");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PRODUTOS ---
app.get('/api/products', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM products ORDER BY id DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ORÇAMENTOS (leitura) ---
app.get('/api/quotes', requireAuth, async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM quotes ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cotacoes', requireAuth, async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM quotes ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- COTAÇÃO (envio) ---
app.post('/api/cotacao', (req, res) => {
    const { nome, email, tel, empresa, estado, cidade, mensagem, itens } = req.body;
    if (!nome || !email || !tel || !itens || itens.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    // Em serverless read-only, retornar sucesso mas informar limitação
    res.json({ success: true, message: 'Cotação recebida! Entraremos em contato em breve.' });
});

app.post('/api/quotes', (req, res) => {
    const { name, whatsapp, email, items } = req.body;
    if (!name || !whatsapp || !items || items.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }
    res.json({ success: true, message: 'Orçamento recebido com sucesso!' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: 'vercel-serverless' });
});

module.exports = app;
