const express = require('express')
const router = express.Router()
const { getLatestReading, getLatestReadingWithCosts, getStatus } = require('../controllers/esp32Controller')
const authMiddleware = require('../middlewares/auth')

router.get('/ultima-leitura', getLatestReading)
router.get('/ultima-leitura-com-custos', authMiddleware, getLatestReadingWithCosts)
router.get('/status', getStatus)

module.exports = router
