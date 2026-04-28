const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat connection pool ke MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengetes koneksi pool ke database
pool.getConnection()
    .then((connection) => {
        console.log('MySQL Database Connected successfully');
        connection.release();
    })
    .catch((err) => {
        console.error('Database Connection Failed:', err.message);
    });

module.exports = pool;
