const express = require('express');
const router = express.Router();
const multer = require('multer');
const foodController = require('../controllers/foodController');

// Mengatur penyimpanan RAM Buffer sementara untuk efisiensi File Gambar
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 25 * 1024 * 1024 // Batasi foto maksimam berukuran 25MB (untuk foto resolusi tinggi)
    }
});

// Endpoint route yang dilindungi upload middleware 
// (Menunggu Request Body jenis mutipart/formData ber-key `image`)
router.post('/analyze-food', upload.single('image'), foodController.analyzeFoodImage);

module.exports = router;
