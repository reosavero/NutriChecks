const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Semua route di bawah ini membutuhkan login (authMiddleware) DAN role admin (adminMiddleware)
router.use(authMiddleware, adminMiddleware);

// Statistik Dashboard Admin
router.get('/admin/stats', adminController.getAdminStats);

// CRUD Users
router.get('/admin/users', adminController.getAllUsers);
router.delete('/admin/users/:id', adminController.deleteUser);
router.put('/admin/users/:id/role', adminController.updateUserRole);

// CRUD Food Catalog
router.get('/admin/food-catalog', adminController.getAllFoodCatalog);
router.post('/admin/food-catalog', adminController.createFoodCatalog);
router.put('/admin/food-catalog/:id', adminController.updateFoodCatalog);
router.delete('/admin/food-catalog/:id', adminController.deleteFoodCatalog);

// Rekomendasi (Klasifikasi Tujuan Makanan)
router.get('/admin/recommendations', adminController.getAllRecommendations);
router.put('/admin/recommendations/bulk', adminController.bulkUpdateRecommendation);
router.put('/admin/recommendations/:id', adminController.updateRecommendation);

module.exports = router;
