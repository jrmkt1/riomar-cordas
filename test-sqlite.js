const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE test (id INT, name TEXT, tag TEXT, obj TEXT)");
    db.run("INSERT INTO test VALUES (1, 'A', 'B', 'C')");

    // Test update with undefined
    db.run("UPDATE test SET name=?, tag=?, obj=? WHERE id=?", ['New', undefined, 'NewObj', 1], function (err) {
        if (err) console.error("Error:", err.message);
        else console.log("Update success, changes:", this.changes);

        db.all("SELECT * FROM test", (err, rows) => {
            console.log("Rows:", rows);
        });
    });
});
