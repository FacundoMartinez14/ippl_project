const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('../controllers/authController');
const { getAllPosts, getPostBySlug, createPost, updatePost, deletePost } = require('../controllers/postController');

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
router.get('/', getAllPosts);
router.get('/slug/:slug', getPostBySlug);

// Rutas protegidas
router.use(verifyToken);
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    
    const newPost = {
      id: Date.now().toString(),
      ...req.body,
      tags: JSON.parse(req.body.tags),
      seo: JSON.parse(req.body.seo),
      thumbnail: req.file ? `/uploads/posts/${req.file.filename}` : undefined,
      views: 0,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: req.body.status === 'published' ? new Date().toISOString() : null
    };

    posts.posts.push(newPost);
    await fs.writeFile(
      path.join(__dirname, '../data/posts.json'),
      JSON.stringify(posts, null, 2)
    );

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ message: 'Error al crear el post' });
  }
});

// Obtener un post por ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const post = posts.posts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ message: 'Error al obtener el post' });
  }
});

router.put('/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const postIndex = posts.posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const updatedPost = {
      ...posts.posts[postIndex],
      ...req.body,
      tags: JSON.parse(req.body.tags),
      seo: JSON.parse(req.body.seo),
      thumbnail: req.file ? `/uploads/posts/${req.file.filename}` : posts.posts[postIndex].thumbnail,
      updatedAt: new Date().toISOString(),
      publishedAt: req.body.status === 'published' && !posts.posts[postIndex].publishedAt 
        ? new Date().toISOString() 
        : posts.posts[postIndex].publishedAt
    };

    posts.posts[postIndex] = updatedPost;
    await fs.writeFile(
      path.join(__dirname, '../data/posts.json'),
      JSON.stringify(posts, null, 2)
    );

    res.json(updatedPost);
  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({ message: 'Error al actualizar el post' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const postIndex = posts.posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    posts.posts.splice(postIndex, 1);
    await fs.writeFile(
      path.join(__dirname, '../data/posts.json'),
      JSON.stringify(posts, null, 2)
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ message: 'Error al eliminar el post' });
  }
});

// Ruta pública para dar like
router.post('/:id/like', async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const postIndex = posts.posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Incrementar el contador de likes
    posts.posts[postIndex].likes = (posts.posts[postIndex].likes || 0) + 1;
    
    await fs.writeFile(
      path.join(__dirname, '../data/posts.json'),
      JSON.stringify(posts, null, 2)
    );

    res.json(posts.posts[postIndex]);
  } catch (error) {
    console.error('Error al dar like al post:', error);
    res.status(500).json({ message: 'Error al dar like al post' });
  }
});

// Verificar si un usuario ha visto un post
router.get('/:id/check-view', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const post = posts.posts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const isViewed = post.viewedBy ? post.viewedBy.includes(userId) : false;
    
    res.json({ isViewed });
  } catch (error) {
    console.error('Error al verificar vista:', error);
    res.status(500).json({ message: 'Error al verificar la vista' });
  }
});

// Incrementar vistas de un post (solo si el usuario no lo ha visto antes)
router.post('/:id/increment-view', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const postIndex = posts.posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Inicializar el array de vistas si no existe
    if (!posts.posts[postIndex].viewedBy) {
      posts.posts[postIndex].viewedBy = [];
    }

    let isViewed = posts.posts[postIndex].viewedBy.includes(userId);

    // Solo incrementar la vista si el usuario no ha visto el post antes
    if (!isViewed) {
      posts.posts[postIndex].viewedBy.push(userId);
      posts.posts[postIndex].views = (posts.posts[postIndex].views || 0) + 1;
      isViewed = true;

      await fs.writeFile(
        path.join(__dirname, '../data/posts.json'),
        JSON.stringify(posts, null, 2)
      );
    }

    res.json({ 
      views: posts.posts[postIndex].views,
      isViewed: isViewed
    });
  } catch (error) {
    console.error('Error al incrementar vista:', error);
    res.status(500).json({ message: 'Error al incrementar la vista' });
  }
});

// Toggle like de un post
router.post('/:id/toggle-like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const postIndex = posts.posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Inicializar el array de likes si no existe
    if (!posts.posts[postIndex].likedBy) {
      posts.posts[postIndex].likedBy = [];
    }

    const userLikeIndex = posts.posts[postIndex].likedBy.indexOf(userId);
    let isLiked = false;

    if (userLikeIndex === -1) {
      // El usuario no ha dado like, añadirlo
      posts.posts[postIndex].likedBy.push(userId);
      posts.posts[postIndex].likes = (posts.posts[postIndex].likes || 0) + 1;
      isLiked = true;
    } else {
      // El usuario ya dio like, quitarlo
      posts.posts[postIndex].likedBy.splice(userLikeIndex, 1);
      posts.posts[postIndex].likes = Math.max(0, (posts.posts[postIndex].likes || 1) - 1);
      isLiked = false;
    }
    
    await fs.writeFile(
      path.join(__dirname, '../data/posts.json'),
      JSON.stringify(posts, null, 2)
    );

    res.json({ 
      likes: posts.posts[postIndex].likes,
      isLiked: isLiked
    });
  } catch (error) {
    console.error('Error al gestionar like:', error);
    res.status(500).json({ message: 'Error al gestionar el like' });
  }
});

// Verificar si un usuario ha dado like a un post
router.get('/:id/check-like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    const post = posts.posts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const isLiked = post.likedBy ? post.likedBy.includes(userId) : false;
    
    res.json({ isLiked });
  } catch (error) {
    console.error('Error al verificar like:', error);
    res.status(500).json({ message: 'Error al verificar el like' });
  }
});

// Obtener estadísticas generales
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
    const usersData = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    
    const posts = JSON.parse(postsData).posts;
    const users = JSON.parse(usersData).users;

    // Calcular estadísticas
    const stats = {
      totalVisits: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      activeUsers: users.filter(user => !user.isDoctor).length,
      activeDoctors: users.filter(user => user.isDoctor).length,
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      weeklyVisits: calculateWeeklyVisits(posts)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// Función auxiliar para calcular las visitas semanales
function calculateWeeklyVisits(posts) {
  const today = new Date();
  const lastWeek = Array(7).fill(0);

  posts.forEach(post => {
    if (!post.viewedBy) return;
    
    post.viewedBy.forEach(view => {
      const viewDate = new Date(view.date);
      const diffDays = Math.floor((today - viewDate) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        lastWeek[6 - diffDays]++;
      }
    });
  });

  return lastWeek;
}

module.exports = router; 