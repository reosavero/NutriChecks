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
    kecepatan FLOAT NOT NULL,     -- kecepatan perubahan berat badan (kg/minggu)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
