const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    ['bitolas', 'cores', 'metragens', 'cargas_ruptura'].forEach(col => {
        db.run(`ALTER TABLE products ADD COLUMN ${col} TEXT`, function (err) {
            if (err) console.error(`Add column ${col} error (might already exist):`, err.message);
            else console.log(`Added column ${col}`);
        });
    });
});
