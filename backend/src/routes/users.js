const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Proteger todas las rutas
router.use(verifyToken);

// Obtener todos los usuarios
router.get('/', getUsers);

// Crear un nuevo usuario
router.post('/', createUser);

// Actualizar un usuario
router.put('/:id', updateUser);

// Eliminar un usuario
router.delete('/:id', deleteUser);

module.exports = router; 