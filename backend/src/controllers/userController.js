const db = require('../config/db');

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Tidak ada file yang diunggah" });
        }
        
        // Simpan relatif path dari folder uploads (agar mudah ditampilkan di frontend)
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Update database user
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);

        return res.status(200).json({ 
            message: "Foto profil berhasil diperbarui",
            avatar: avatarUrl
        });
    } catch (error) {
        console.error("Upload Avatar Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server saat mengunggah foto." });
    }
};
