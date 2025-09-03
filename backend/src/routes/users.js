const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getUserById, getUsers, createUser, updateUser, deleteUser, abonarComision, getAbonos, getProfessionals } = require('../controllers/userController');

// Proteger todas las rutas
router.use(verifyToken);

// Obtener todos los usuarios
router.get('/', getUsers);

// Obtener todos los profesionales
router.get('/professionals', getProfessionals);

// Obtener todos los abonos individuales
router.get('/abonos', getAbonos);

// Obtener todos los usuarios
router.get('/:id', getUserById);

// Crear un nuevo usuario
router.post('/', createUser);

// Actualizar un usuario
router.put('/:id', updateUser);

// Eliminar un usuario
router.delete('/:id', deleteUser);

// Abonar comisión a un profesional
router.post('/:id/abonar-comision', abonarComision);

module.exports = router; 