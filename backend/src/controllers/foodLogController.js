const db = require('../config/db');

// POST /api/food-logs — Simpan makanan ke log harian user
exports.createFoodLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      nama_makanan, porsi, kalori, protein, karbohidrat, lemak, image_url, 
      waktu_makan = 'sarapan', 
      tanggal = new Date().toISOString().split('T')[0] 
    } = req.body;

    // Pemetaan porsi: Jika input bukan sedikit/normal/banyak, ubah ke normal
    const allowedPorsi = ['sedikit', 'normal', 'banyak'];
    const finalPorsi = allowedPorsi.includes(porsi?.toLowerCase()) ? porsi.toLowerCase() : 'normal';

    if (!nama_makanan || kalori === undefined) {
      return res.status(400).json({ success: false, message: 'Nama makanan dan kalori wajib diisi.' });
    }

    const [result] = await db.query(
      'INSERT INTO food_logs (user_id, nama_makanan, porsi, kalori, protein, karbohidrat, lemak, waktu_makan, tanggal, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, nama_makanan, finalPorsi, kalori, protein || 0, karbohidrat || 0, lemak || 0, waktu_makan, tanggal, image_url || null]
    );

    res.status(201).json({ success: true, message: 'Makanan berhasil dicatat.', data: { id: result.insertId } });
  } catch (error) {
    console.error('createFoodLog Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mencatat makanan.' });
  }
};

// GET /api/food-logs — Ambil semua food log milik user (dikelompokkan per minggu & hari)
exports.getFoodLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const [logs] = await db.query(
      'SELECT * FROM food_logs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('getFoodLogs Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat makanan.' });
  }
};

// DELETE /api/food-logs/:id — Hapus satu food log
exports.deleteFoodLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM food_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Log makanan tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Log makanan berhasil dihapus.' });
  } catch (error) {
    console.error('deleteFoodLog Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus log makanan.' });
  }
};

// GET /api/food-catalog/public — Ambil makanan dari katalog untuk user pilih (rekomendasi)
exports.getPublicFoodCatalog = async (req, res) => {
  try {
    const { tujuan } = req.query;
    let query = 'SELECT id, name, kalori, protein, karbohidrat, lemak, kategori, tujuan, image_url FROM food_catalog';
    let params = [];

    if (tujuan && tujuan !== 'semua') {
      query += ' WHERE tujuan = ?';
      params.push(tujuan);
    }

    query += ' ORDER BY name ASC';

    const [foods] = await db.query(query, params);
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error('getPublicFoodCatalog Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data katalog makanan.' });
  }
};
