const express = require('express');
const router = express.Router();
const { registerDevice, listDevices, deleteDevice } = require('../controllers/devicesController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, registerDevice);
router.get('/', authMiddleware, listDevices);
router.delete('/:id', authMiddleware, deleteDevice);

module.exports = router;