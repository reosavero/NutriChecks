require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const foodLogRoutes = require('./src/routes/foodLogRoutes');
const path = require('path');

const app = express();

// Konfigurasi Middleware
app.use(cors());                 // Mengizinkan komunikasi lintas domain (dari frontend ke backend)
app.use(express.json());         // Agar server dapat membaca Request Body berformat JSON

// Serve foldel static untuk file upload
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Menggunakan Routes API
app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', foodRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', foodLogRoutes);

// Endpoint Health Check
app.get('/', (req, res) => {
    res.send('✅ Server API Backend Nutricheck telah aktif!');
});

// Menentukan Port
const PORT = process.env.PORT || 5000;

// Menjalankan Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan pada URL http://localhost:${PORT}`);
    console.log(`📱 Untuk akses dari HP, gunakan: http://<IP-Komputer>:${PORT}`);
});
