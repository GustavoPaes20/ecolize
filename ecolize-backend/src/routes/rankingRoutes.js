const express = require('express');
const router = express.Router();
const { getCurrentRanking, getRankingHistory } = require('../controllers/rankingController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getCurrentRanking);
router.get('/history', authMiddleware, getRankingHistory);

module.exports = router;