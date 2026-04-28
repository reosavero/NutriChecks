const db = require('../config/db');

/**
 * Middleware untuk memverifikasi bahwa user yang sedang login memiliki role 'admin'.
 * Middleware ini HARUS digunakan SETELAH authMiddleware (karena butuh req.user.id).
 */
module.exports = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        if (rows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak. Anda bukan administrator.' });
        }

        // User adalah admin, lanjutkan ke controller
        next();
    } catch (error) {
        console.error('Admin Middleware Error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat verifikasi hak akses.' });
    }
};
