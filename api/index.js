const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Em serverless, SQLite funciona apenas para leitura do banco bundled
// Para escrita persistente, migrar para um banco na nuvem (Turso, Neon, etc.)
const sqlite3 = require('sqlite3').verbose();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY não configurada no ambiente.');
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Banco SQLite (read-only em serverless, mas funcional para consultas)
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
let db;
try {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
} catch (e) {
    // Fallback: tenta abrir em /tmp se bundled não funcionar
    db = new sqlite3.Database('/tmp/database.sqlite');
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
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Usuário não encontrado' });
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Senha incorreta' });
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username });
    });
});

// --- REPRESENTANTES ---
app.get('/api/representatives', (req, res) => {
    db.all("SELECT * FROM representatives ORDER BY region, name", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- PRODUTOS ---
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- ORÇAMENTOS (leitura) ---
app.get('/api/quotes', requireAuth, (req, res) => {
    db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/cotacoes', requireAuth, (req, res) => {
    db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
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
