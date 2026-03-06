const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return console.error(err);
    console.log("Current Products:");
    console.dir(rows);

    // Simulate what the server does
    const id = rows.length > 0 ? rows[0].id : 1;
    const title = "Changed Title";
    const tag = "New Tag";
    const description = "New Desc";
    const tags = undefined;
    const imageUrl = "images/prod-mock.jpg";

    if (rows.length > 0) {
        db.run(
            "UPDATE products SET title=?, tag=?, description=?, tags=?, image_url=? WHERE id=?",
            [title, tag, description, tags, imageUrl, id],
            function (err) {
                if (err) console.error("Update err:", err.message);
                else {
                    console.log("Updated rows:", this.changes);
                    db.all("SELECT * FROM products WHERE id=?", [id], (err, rows) => {
                        console.log("After update:", rows);
                    });
                }
            }
        );
    } else {
        console.log("No products to update.");
    }
});
