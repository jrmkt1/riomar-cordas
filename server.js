const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'riomar_super_secret_key_123';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS, imagens) do front-end principal
app.use(express.static(path.join(__dirname, '/')));

// Upload de Arquivos (Imagens de Produtos)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images')); // Salva na pasta images já existente
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prod-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// === MIDDLEWARE DE AUTENTICAÇÃO ===
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

// ==========================================
// ROTAS DE API
// ==========================================

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

app.post('/api/representatives', requireAuth, (req, res) => {
    const { name, region, states, phone, email, whatsapp } = req.body;
    const stmt = db.prepare("INSERT INTO representatives (name, region, states, phone, email, whatsapp) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run([name, region, states, phone, email, whatsapp], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Representante adicionado' });
    });
});

app.put('/api/representatives/:id', requireAuth, (req, res) => {
    const { name, region, states, phone, email, whatsapp } = req.body;
    db.run(
        "UPDATE representatives SET name=?, region=?, states=?, phone=?, email=?, whatsapp=? WHERE id=?",
        [name, region, states, phone, email, whatsapp, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Representante não encontrado' });
            res.json({ message: 'Representante atualizado com sucesso' });
        }
    );
});

app.delete('/api/representatives/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM representatives WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Representante não encontrado' });
        res.json({ message: 'Apagado com sucesso' });
    });
});

// --- PRODUTOS ---
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', requireAuth, upload.single('image'), (req, res) => {
    const { title, tag, description, tags, bitolas, cores, metragens, cargas_ruptura } = req.body;
    const imageUrl = req.file ? 'images/' + req.file.filename : null;

    const stmt = db.prepare("INSERT INTO products (title, tag, description, tags, image_url, bitolas, cores, metragens, cargas_ruptura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run([title, tag, description, tags, imageUrl, bitolas, cores, metragens, cargas_ruptura], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Produto cadastrado!' });
    });
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto apagado' });
    });
});

app.put('/api/products/:id', requireAuth, upload.single('image'), (req, res) => {
    const { title, tag, description, bitolas, cores, metragens, cargas_ruptura } = req.body;
    const imageUrl = req.file ? 'images/' + req.file.filename : null;

    if (imageUrl) {
        db.run(
            "UPDATE products SET title=?, tag=?, description=?, image_url=?, bitolas=?, cores=?, metragens=?, cargas_ruptura=? WHERE id=?",
            [title, tag, description, imageUrl, bitolas, cores, metragens, cargas_ruptura, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Produto atualizado' });
            }
        );
    } else {
        db.run(
            "UPDATE products SET title=?, tag=?, description=?, bitolas=?, cores=?, metragens=?, cargas_ruptura=? WHERE id=?",
            [title, tag, description, bitolas, cores, metragens, cargas_ruptura, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Produto atualizado' });
            }
        );
    }
});

// --- ORÇAMENTOS (QUOTES) ---
app.post('/api/quotes', (req, res) => {
    // Tabela de Solicitações de Orçamentos do site
    const { name, whatsapp, email, items } = req.body;

    if (!name || !whatsapp || !items || items.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const itemsStr = JSON.stringify(items);

    const stmt = db.prepare("INSERT INTO quotes (customer_name, customer_whatsapp, customer_email, items_json) VALUES (?, ?, ?, ?)");
    stmt.run([name, whatsapp, email, itemsStr], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Orçamento recebido com sucesso!', quoteId: this.lastID });
    });
});

app.get('/api/quotes', requireAuth, (req, res) => {
    // Admin ver orçamentos
    db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/quotes/:id/status', requireAuth, (req, res) => {
    // Admin mudar status (Pendente / Atendido)
    const { status } = req.body;
    db.run("UPDATE quotes SET status = ? WHERE id = ?", [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status atualizado' });
    });
});

// --- COTAÇÃO (widget de produto) ---
app.post('/api/cotacao', (req, res) => {
    const { nome, email, tel, empresa, estado, cidade, mensagem, itens } = req.body;

    if (!nome || !email || !tel || !itens || itens.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos. Preencha nome, e-mail, telefone e ao menos 1 item.' });
    }

    const itemsStr = JSON.stringify(itens);
    const extra = JSON.stringify({ empresa, estado, cidade, mensagem });

    const stmt = db.prepare(
        "INSERT INTO quotes (customer_name, customer_whatsapp, customer_email, items_json, status) VALUES (?, ?, ?, ?, 'Pendente')"
    );
    stmt.run([nome, tel, email, itemsStr + ' | Extras: ' + extra], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Cotação recebida! Entraremos em contato em breve.', id: this.lastID });
    });
});

// Alias para manter compatibilidade
app.get('/api/cotacoes', requireAuth, (req, res) => {
    db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// Serve a página Admin para qualquer rota /admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Inicia Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse o site localmente em: http://localhost:${PORT}`);
    console.log(`🔒 Painel Admin em: http://localhost:${PORT}/admin`);
});
