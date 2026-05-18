const express = require('express')
const router = express.Router()
const { createEsp32WaterReading, createEsp32EnergyReading } = require('../controllers/esp32Controller')

router.post('/agua', createEsp32WaterReading)
router.post('/luz', createEsp32EnergyReading)

module.exports = router
