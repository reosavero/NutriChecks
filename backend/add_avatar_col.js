const db = require('./src/config/db');

async function main() {
    try {
        await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL');
        console.log("Column avatar added successfully!");
    } catch(err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
        } else {
            console.error("Error adding column:", err);
        }
    }
    process.exit(0);
}
main();
