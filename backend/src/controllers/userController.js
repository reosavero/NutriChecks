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

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nama, gender, berat_badan, tinggi_badan, usia, target_berat, tujuan, kecepatan } = req.body;

        // Hitung ulang target kalori berdasarkan data baru
        const bb = parseFloat(berat_badan);
        const tb = parseFloat(tinggi_badan);
        const age = parseInt(usia);
        
        let bmr = 0;
        if (gender === 'laki-laki') {
            bmr = (10 * bb) + (6.25 * tb) - (5 * age) + 5;
        } else {
            bmr = (10 * bb) + (6.25 * tb) - (5 * age) - 161;
        }

        const tdee = bmr * 1.2;
        let kecepatanValue = 0.5;
        if (kecepatan === 'lambat') kecepatanValue = 0.25;
        if (kecepatan === 'cepat') kecepatanValue = 1.0;
        
        const adjustment = (kecepatanValue * 7700) / 7;
        let target_kalori = Math.round(tdee);
        if (tujuan === 'menurunkan berat badan') target_kalori = Math.round(tdee - adjustment);
        else if (tujuan === 'menaikkan berat badan') target_kalori = Math.round(tdee + adjustment);

        await db.query(
            `UPDATE users SET 
                nama = ?, gender = ?, berat_badan = ?, tinggi_badan = ?, 
                usia = ?, target_berat = ?, tujuan = ?, kecepatan = ?, target_kalori = ? 
            WHERE id = ?`,
            [nama, gender, berat_badan, tinggi_badan, usia, target_berat, tujuan, kecepatan, target_kalori, userId]
        );

        return res.status(200).json({ message: "Profil berhasil diperbarui", target_kalori });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ message: "Gagal memperbarui profil." });
    }
};
