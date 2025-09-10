const express = require('express');
const router = express.Router();
const fsSync = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('../controllers/authController');
const postController = require('../controllers/postController');

// Asegurar que existan los directorios necesarios
const createRequiredDirectories = () => {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const postsDir = path.join(uploadsDir, 'posts');
  
  if (!fsSync.existsSync(uploadsDir)) {
    fsSync.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fsSync.existsSync(postsDir)) {
    fsSync.mkdirSync(postsDir, { recursive: true });
  }
};

// Crear directorios al iniciar
createRequiredDirectories();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'posts');
    // Asegurar que el directorio existe antes de cada upload
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rutas públicas
router.get('/', postController.getAllPosts);
router.get('/:section', postController.getPostBySection);
router.get('/slug/:slug', postController.getPostBySlug);

// Rutas protegidas
router.use(verifyToken);
router.post('/', upload.single('thumbnail'), postController.createPost);

// Obtener un post por ID
router.get('/:id', verifyToken, postController.getPostById);

router.put('/:id', upload.single('thumbnail'), postController.updatePost);

router.delete('/:id', postController.deletePost);

// Verificar si un usuario ha visto un post
router.get('/:id/check-view', verifyToken, postController.checkPostViewed);

// Incrementar vistas de un post (solo si el usuario no lo ha visto antes)
router.post('/:id/increment-view', verifyToken, postController.incrementPostView);

// Toggle like de un post
router.post('/:id/toggle-like', verifyToken, postController.togglePostLike);

// Verificar si un usuario ha dado like a un post
router.get('/:id/check-like', verifyToken, postController.checkPostLike);

// Obtener estadísticas generales
router.get('/stats', verifyToken, postController.getPostsStats);

module.exports = router; 