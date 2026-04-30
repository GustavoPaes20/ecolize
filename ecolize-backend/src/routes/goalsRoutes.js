const express = require('express');
const router = express.Router();
const { getGoals, upsertGoals } = require('../controllers/goalsController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getGoals);
router.post('/', authMiddleware, upsertGoals);

module.exports = router;