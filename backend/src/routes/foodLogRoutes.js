const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const foodLogController = require('../controllers/foodLogController');

// Semua route food-logs membutuhkan login
router.post('/food-logs', authMiddleware, foodLogController.createFoodLog);
router.get('/food-logs', authMiddleware, foodLogController.getFoodLogs);
router.delete('/food-logs/:id', authMiddleware, foodLogController.deleteFoodLog);

// Public food catalog (untuk user pilih dari rekomendasi)
router.get('/food-catalog/public', authMiddleware, foodLogController.getPublicFoodCatalog);

module.exports = router;
