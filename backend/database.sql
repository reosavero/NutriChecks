CREATE DATABASE IF NOT EXISTS nutricheck_db;
USE nutricheck_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    berat_badan FLOAT NOT NULL,  -- dalam kilogram (kg)
    tinggi_badan FLOAT NOT NULL, -- dalam centimeter (cm)
    usia INT NOT NULL,           -- dalam tahun
    gender ENUM('laki-laki', 'perempuan') NOT NULL,
    target_berat FLOAT NOT NULL, -- target berat dalam kilogram (kg)
    target_kalori FLOAT,         -- dihitung secara otomatis (Kkal)
    tujuan VARCHAR(255) NOT NULL, -- tujuan kesehatan (misal: menurunkan berat badan)
    kecepatan ENUM('lambat', 'normal', 'cepat') DEFAULT 'normal', -- kecepatan perubahan berat badan
    role ENUM('user', 'admin') DEFAULT 'user', -- peran user (admin memiliki hak kelola master data)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk merekam data berat badan secara berkala (Tracking Berat Badan)
CREATE TABLE IF NOT EXISTS weight_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    berat FLOAT NOT NULL,           -- Berat badan pada saat pencatatan
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kapan berat ditambahkan
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk merekam log makanan harian (Pencatatan Nutrisi)
-- Tabel ini adalah satu-satunya sumber data untuk riwayat harian, mingguan, dan laporan nutrisi.
CREATE TABLE IF NOT EXISTS food_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_makanan VARCHAR(255) NOT NULL,
    porsi ENUM('sedikit', 'normal', 'banyak') DEFAULT 'normal',
    kalori FLOAT NOT NULL DEFAULT 0,
    protein FLOAT NOT NULL DEFAULT 0,
    karbohidrat FLOAT NOT NULL DEFAULT 0,
    lemak FLOAT NOT NULL DEFAULT 0,
    waktu_makan ENUM('sarapan', 'makan siang', 'makan malam', 'camilan') DEFAULT 'sarapan',
    tanggal DATE NOT NULL,          -- Tanggal spesifik makanan dikonsumsi
    image_url VARCHAR(500),         -- Jika makanan di-scan dari foto AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel MASTER MAKANAN (Kelolaan Admin untuk halaman NutriCatalog / Menu)
CREATE TABLE IF NOT EXISTS food_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    kalori FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    karbohidrat FLOAT NOT NULL,
    lemak FLOAT NOT NULL,
    kategori VARCHAR(100),       -- misal: "High Protein", "Breakfast"
    tujuan ENUM('belum ditentukan', 'menurunkan berat badan', 'menaikkan berat badan') DEFAULT 'belum ditentukan',
    image_url VARCHAR(500),      -- gambar ilustrasi makanan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query migrasi (jalankan SEKALI jika tabel food_catalog sudah ada sebelumnya):
-- ALTER TABLE food_catalog ADD COLUMN tujuan ENUM('belum ditentukan', 'menurunkan berat badan', 'menaikkan berat badan') DEFAULT 'belum ditentukan' AFTER kategori;

