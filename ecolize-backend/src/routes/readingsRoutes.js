const express = require('express');
const router = express.Router();
const { createReading, getReadings, getSummary } = require('../controllers/readingsController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, createReading);
router.get('/', authMiddleware, getReadings);
router.get('/summary', authMiddleware, getSummary);

module.exports = router;