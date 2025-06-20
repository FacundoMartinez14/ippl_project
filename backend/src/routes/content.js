const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticateToken } = require('../middleware/auth');

// Proteger todas las rutas de contenido
router.use(authenticateToken);

router.get('/carousel', contentController.getCarouselImages);
router.delete('/carousel/:filename', contentController.deleteCarouselImage);

module.exports = router; 