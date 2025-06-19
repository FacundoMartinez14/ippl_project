const fs = require('fs').promises;
const path = require('path');

const POSTS_FILE = path.join(__dirname, '../data/posts.json');

const getAllPosts = async (req, res) => {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    const posts = JSON.parse(data);
    res.json(posts);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(POSTS_FILE, JSON.stringify({ posts: [] }));
      return res.json({ posts: [] });
    }
    res.status(500).json({ message: 'Error al obtener posts' });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    const { posts } = JSON.parse(data);
    
    const post = posts.find(p => p.slug === slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Error al obtener post por slug:', error);
    res.status(500).json({ message: 'Error al obtener el post' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, section } = req.body;
    const author = req.user.id; // Obtenido del token JWT
    
    let data = { posts: [] };
    try {
      const fileContent = await fs.readFile(POSTS_FILE, 'utf8');
      data = JSON.parse(fileContent);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      section,
      author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.posts.push(newPost);
    
    await fs.writeFile(POSTS_FILE, JSON.stringify(data, null, 2));
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ message: 'Error al crear post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, section } = req.body;
    
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    const { posts } = JSON.parse(data);
    
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    // Verifica que el usuario sea el autor o un admin
    if (posts[postIndex].author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      section,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(POSTS_FILE, JSON.stringify({ posts }, null, 2));
    
    res.json(posts[postIndex]);
  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({ message: 'Error al actualizar post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    const { posts } = JSON.parse(data);
    
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    // Verifica que el usuario sea el autor o un admin
    if (posts[postIndex].author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    posts.splice(postIndex, 1);
    
    await fs.writeFile(POSTS_FILE, JSON.stringify({ posts }, null, 2));
    
    res.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ message: 'Error al eliminar post' });
  }
};

module.exports = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
}; 