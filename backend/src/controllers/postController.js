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
    const { title, content, section, excerpt, tags, seo, status = 'draft' } = req.body;
    const author = req.user.id;
    const authorName = req.user.name;

    if (!title || !content || !section) {
      return res.status(400).json({ 
        success: false,
        message: 'Faltan campos requeridos (título, contenido o sección)' 
      });
    }

    let data = { posts: [] };
    try {
      const fileContent = await fs.readFile(POSTS_FILE, 'utf8');
      data = JSON.parse(fileContent);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error al leer el archivo de posts:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Error al leer la base de datos de posts' 
        });
      }
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      section,
      excerpt: excerpt || '',
      tags: tags ? JSON.parse(tags) : [],
      seo: seo ? JSON.parse(seo) : {},
      author,
      authorName,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.posts.push(newPost);

    try {
      await fs.writeFile(POSTS_FILE, JSON.stringify(data, null, 2));
      return res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        post: newPost
      });
    } catch (writeError) {
      console.error('Error al escribir el archivo de posts:', writeError);
      return res.status(500).json({ 
        success: false,
        message: 'Error al guardar el post en la base de datos' 
      });
    }
  } catch (error) {
    console.error('Error al crear post:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al crear el post',
      error: error.message 
    });
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