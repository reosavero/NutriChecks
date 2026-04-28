const db = require('../config/db');
const bcrypt = require('bcrypt');

// =============================================
// KELOLA USERS
// =============================================

// GET /api/admin/users — Ambil semua user
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, nama, email, berat_badan, tinggi_badan, usia, gender, target_berat, target_kalori, tujuan, kecepatan, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('getAllUsers Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data users.' });
    }
};

// DELETE /api/admin/users/:id — Hapus user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Cegah admin menghapus dirinya sendiri
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Anda tidak bisa menghapus akun Anda sendiri.' });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        res.json({ success: true, message: 'User berhasil dihapus.' });
    } catch (error) {
        console.error('deleteUser Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
    }
};

// PUT /api/admin/users/:id/role — Update role user (admin/user)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role tidak valid. Pilih "user" atau "admin".' });
        }

        const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        res.json({ success: true, message: `Role berhasil diubah menjadi "${role}".` });
    } catch (error) {
        console.error('updateUserRole Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah role user.' });
    }
};

// =============================================
// KELOLA FOOD CATALOG (Master Makanan)
// =============================================

// GET /api/admin/food-catalog — Ambil semua item katalog
exports.getAllFoodCatalog = async (req, res) => {
    try {
        const [foods] = await db.query('SELECT * FROM food_catalog ORDER BY created_at DESC');
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error('getAllFoodCatalog Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data food catalog.' });
    }
};

// POST /api/admin/food-catalog — Tambah item baru
exports.createFoodCatalog = async (req, res) => {
    try {
        const { name, kalori, protein, karbohidrat, lemak, kategori, image_url } = req.body;

        if (!name || kalori === undefined || protein === undefined || karbohidrat === undefined || lemak === undefined) {
            return res.status(400).json({ success: false, message: 'Nama, kalori, protein, karbohidrat, dan lemak wajib diisi.' });
        }

        const [result] = await db.query(
            'INSERT INTO food_catalog (name, kalori, protein, karbohidrat, lemak, kategori, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, kalori, protein, karbohidrat, lemak, kategori || null, image_url || null]
        );

        res.status(201).json({ success: true, message: 'Makanan berhasil ditambahkan.', data: { id: result.insertId } });
    } catch (error) {
        console.error('createFoodCatalog Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan makanan.' });
    }
};

// PUT /api/admin/food-catalog/:id — Edit item
exports.updateFoodCatalog = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, kalori, protein, karbohidrat, lemak, kategori, image_url } = req.body;

        const [result] = await db.query(
            'UPDATE food_catalog SET name = ?, kalori = ?, protein = ?, karbohidrat = ?, lemak = ?, kategori = ?, image_url = ? WHERE id = ?',
            [name, kalori, protein, karbohidrat, lemak, kategori || null, image_url || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item makanan tidak ditemukan.' });
        }

        res.json({ success: true, message: 'Makanan berhasil diperbarui.' });
    } catch (error) {
        console.error('updateFoodCatalog Error:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui makanan.' });
    }
};

// DELETE /api/admin/food-catalog/:id — Hapus item
exports.deleteFoodCatalog = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM food_catalog WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item makanan tidak ditemukan.' });
        }

        res.json({ success: true, message: 'Makanan berhasil dihapus.' });
    } catch (error) {
        console.error('deleteFoodCatalog Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus makanan.' });
    }
};

// =============================================
// KELOLA REKOMENDASI (Klasifikasi Tujuan Makanan)
// =============================================

// GET /api/admin/recommendations — Ambil semua makanan yg sudah/belum diklasifikasikan
exports.getAllRecommendations = async (req, res) => {
    try {
        const [foods] = await db.query(
            'SELECT id, name, kalori, protein, karbohidrat, lemak, kategori, tujuan, image_url FROM food_catalog ORDER BY FIELD(tujuan, "belum ditentukan", "menurunkan berat badan", "menaikkan berat badan"), name ASC'
        );
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error('getAllRecommendations Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data rekomendasi.' });
    }
};

// PUT /api/admin/recommendations/:id — Update tujuan makanan
exports.updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { tujuan } = req.body;

        const validTujuan = ['belum ditentukan', 'menurunkan berat badan', 'menaikkan berat badan'];
        if (!validTujuan.includes(tujuan)) {
            return res.status(400).json({ success: false, message: 'Tujuan tidak valid.' });
        }

        const [result] = await db.query(
            'UPDATE food_catalog SET tujuan = ? WHERE id = ?',
            [tujuan, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item makanan tidak ditemukan.' });
        }

        res.json({ success: true, message: `Tujuan makanan berhasil diperbarui menjadi "${tujuan}".` });
    } catch (error) {
        console.error('updateRecommendation Error:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui tujuan makanan.' });
    }
};

// PUT /api/admin/recommendations/bulk — Update tujuan banyak makanan sekaligus
exports.bulkUpdateRecommendation = async (req, res) => {
    try {
        const { ids, tujuan } = req.body;

        const validTujuan = ['belum ditentukan', 'menurunkan berat badan', 'menaikkan berat badan'];
        if (!validTujuan.includes(tujuan) || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Data tidak valid.' });
        }

        const [result] = await db.query(
            'UPDATE food_catalog SET tujuan = ? WHERE id IN (?)',
            [tujuan, ids]
        );

        res.json({ success: true, message: `${result.affectedRows} makanan berhasil diperbarui.` });
    } catch (error) {
        console.error('bulkUpdateRecommendation Error:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui tujuan makanan.' });
    }
};

// =============================================
// STATISTIK DASHBOARD ADMIN
// =============================================

// GET /api/admin/stats — Statistik ringkas untuk dashboard admin
exports.getAdminStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalFoods }]] = await db.query('SELECT COUNT(*) AS totalFoods FROM food_catalog');
        const [[{ totalClassified }]] = await db.query("SELECT COUNT(*) AS totalClassified FROM food_catalog WHERE tujuan != 'belum ditentukan'");
        const [[{ totalFoodLogs }]] = await db.query('SELECT COUNT(*) AS totalFoodLogs FROM food_logs');

        res.json({
            success: true,
            data: {
                totalUsers,
                totalFoods,
                totalClassified,
                totalFoodLogs
            }
        });
    } catch (error) {
        console.error('getAdminStats Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil statistik.' });
    }
};
