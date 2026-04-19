const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Ruta de registro
router.post('/register', register);

// Ruta de inicio de sesión
router.post('/login', login);

module.exports = router;
