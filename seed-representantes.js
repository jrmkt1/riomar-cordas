/**
 * Seed Script – Representantes Riomar Cordas
 * Baseado nos dados originais do site riomarcordas.com.br
 *
 * Uso: node seed-representantes.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// ─────────────────────────────────────────────────────────────────────────────
// DADOS REAIS DOS REPRESENTANTES RIOMAR CORDAS
// Estados devem ser em minúsculo, separados por vírgula (sem espaço)
// para bater com os IDs do SVG do mapa.
// ─────────────────────────────────────────────────────────────────────────────
const representantes = [
    // ── REGIÃO SUL ──────────────────────────────────────────────────────────────
    {
        name: 'Claudino Stulp',
        region: 'Sul',
        states: 'rs',
        phone: '54 99636-2344',
        email: '',
        whatsapp: '54 99636-2344',
    },
    {
        name: 'Eliz Luiz Maroneze',
        region: 'Sul',
        states: 'sc,pr',
        phone: '47 3472-1039',
        email: '',
        whatsapp: '47 99972-1039',
    },

    // ── REGIÃO SUDESTE ───────────────────────────────────────────────────────────
    {
        name: 'Antônio Marcos',
        region: 'Sudeste',
        states: 'sp',
        phone: '11 4992-1765',
        email: '',
        whatsapp: '11 94992-1765',
    },
    {
        name: 'Carlos André',
        region: 'Sudeste',
        states: 'rj,es',
        phone: '21 99683-0808',
        email: '',
        whatsapp: '21 99683-0808',
    },
    {
        name: 'Eder Antônio',
        region: 'Sudeste',
        states: 'mg',
        phone: '31 99285-5545',
        email: '',
        whatsapp: '31 99285-5545',
    },

    // ── REGIÃO NORDESTE ──────────────────────────────────────────────────────────
    {
        name: 'José Augusto (Guto)',
        region: 'Nordeste',
        states: 'ba,se',
        phone: '71 99255-4009',
        email: '',
        whatsapp: '71 99255-4009',
    },
    {
        name: 'Marcos Aurélio',
        region: 'Nordeste',
        states: 'pe,al,pb,rn',
        phone: '81 99704-1300',
        email: '',
        whatsapp: '81 99704-1300',
    },
    {
        name: 'Francisco Cansanção',
        region: 'Nordeste',
        states: 'ce,ma,pi',
        phone: '85 99981-1420',
        email: '',
        whatsapp: '85 99981-1420',
    },

    // ── REGIÃO CENTRO-OESTE ──────────────────────────────────────────────────────
    {
        name: 'Sérgio Tiba',
        region: 'Centro-Oeste',
        states: 'go,df,mt,ms,to',
        phone: '62 99333-4570',
        email: '',
        whatsapp: '62 99333-4570',
    },

    // ── REGIÃO NORTE ─────────────────────────────────────────────────────────────
    {
        name: 'Representante 0800 – Riomar',
        region: 'Norte',
        states: 'pa,am,ro,ac,ap,rr',
        phone: '0800-726-0909',
        email: 'riomar@riomarcordas.com.br',
        whatsapp: '4733210800',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXECUÇÃO
// ─────────────────────────────────────────────────────────────────────────────
db.serialize(() => {
    console.log('🗑️  Limpando tabela de representantes...');
    db.run('DELETE FROM representatives', [], function (err) {
        if (err) { console.error('Erro ao limpar:', err.message); return; }
        console.log(`   Registros removidos: ${this.changes}`);

        console.log('➕ Inserindo representantes...');
        const stmt = db.prepare(
            'INSERT INTO representatives (name, region, states, phone, email, whatsapp) VALUES (?, ?, ?, ?, ?, ?)'
        );

        representantes.forEach((rep) => {
            stmt.run([rep.name, rep.region, rep.states, rep.phone, rep.email, rep.whatsapp], (err) => {
                if (err) console.error(`   ❌ Erro ao inserir ${rep.name}:`, err.message);
                else console.log(`   ✅ ${rep.name} (${rep.states.toUpperCase()})`);
            });
        });

        stmt.finalize(() => {
            db.all('SELECT * FROM representatives', [], (err, rows) => {
                if (err) { console.error(err.message); return; }
                console.log(`\n✨ Total de representantes cadastrados: ${rows.length}`);
                db.close(() => console.log('✔️  Banco de dados fechado.'));
            });
        });
    });
});
