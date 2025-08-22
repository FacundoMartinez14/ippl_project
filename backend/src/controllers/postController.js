const { Op } = require('sequelize');
const { Post } = require('../../models');
const { toPostDTO, toPostDTOList } = require('../../mappers/PostMapper');

function tryParseJSON(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // quita símbolos
    .trim()
    .replace(/\s+/g, '-')            // espacios -> guiones
    .replace(/-+/g, '-');            // colapsa guiones
}

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { active: true },                 // ✅ solo activos
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
    });
    return res.json({ posts: toPostDTOList(posts) });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    return res.status(500).json({ message: 'Error al obtener posts' });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ where: { slug, active: true } }); // ✅
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });
    return res.json({ post: toPostDTO(post) });
  } catch (error) {
    console.error('Error al obtener post por slug:', error);
    return res.status(500).json({ message: 'Error al obtener el post' });
  }
};

const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      section,
      excerpt = '',
      tags,
      seo,
      status = 'draft',
      slug,               // opcional
      thumbnail,          // opcional
      featured,           // opcional
      readTime,           // opcional
    } = req.body;

    const authorId = req.user?.id;
    const authorName = req.user?.name;

    if (!title || !content || !section) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (título, contenido o sección)',
      });
    }

    const tagsJson = tryParseJSON(tags, Array.isArray(tags) ? tags : []);
    const seoJson = tryParseJSON(seo, typeof seo === 'object' && seo ? seo : {});

    // slug opcional (no autogeneramos si no viene, a menos que quieras lo contrario)
    let uniqueSlug = null;
    if (slug) {
      const base = slugify(slug);
      uniqueSlug = base;
      let suffix = 1;
      while (await Post.findOne({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${base}-${suffix++}`;
      }
    }

    const created = await Post.create({
      title,
      content,
      section,
      excerpt,
      tags: tagsJson,
      seo: seoJson,
      authorId,
      authorName,
      status,
      slug: uniqueSlug,
      thumbnail: thumbnail ?? null,
      featured: typeof featured === 'boolean' ? featured : !!(featured === 'true'),
      readTime: readTime ?? '1 min',
      views: 0,
      likes: 0,
      comments: [],
      likedBy: [],
      viewedBy: [],
    });

    return res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      post: toPostDTO(created),
    });
  } catch (error) {
    console.error('Error al crear post:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el post',
      error: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);
    if (!post || !post.active) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Autorización: autor o admin
    const isAuthor = String(post.authorId ?? '') === String(req.user?.id ?? '');
    const isAdmin = req.user?.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const {
      title, content, section, excerpt, tags, seo,
      status, slug, thumbnail, featured, readTime,
    } = req.body;

    const updates = {};

    if (title != null) updates.title = title;
    if (content != null) updates.content = content;
    if (section != null) updates.section = section;
    if (excerpt != null) updates.excerpt = excerpt;
    if (tags !== undefined) updates.tags = tryParseJSON(tags, Array.isArray(tags) ? tags : []);
    if (seo !== undefined) updates.seo = tryParseJSON(seo, typeof seo === 'object' && seo ? seo : {});
    if (thumbnail !== undefined) updates.thumbnail = thumbnail ?? null;
    if (featured !== undefined) {
      updates.featured = typeof featured === 'boolean' ? featured : !!(featured === 'true');
    }
    if (readTime !== undefined) updates.readTime = readTime;

    if (slug !== undefined && slug !== post.slug) {
      if (slug) {
        const base = slugify(slug);
        let uniqueSlug = base, suffix = 1;
        while (await Post.findOne({ where: { slug: uniqueSlug, id: { [Op.ne]: id } } })) {
          uniqueSlug = `${base}-${suffix++}`;
        }
        updates.slug = uniqueSlug;
      } else {
        updates.slug = null;
      }
    }

    if (status !== undefined && status !== post.status) {
      updates.status = status;
      if (status === 'published' && !post.publishedAt) {
        updates.publishedAt = new Date();
      }
      // Si se vuelve a draft NO borro publishedAt, salvo que venga explícito:
      if (status === 'draft' && publishedAt === null) {
        updates.publishedAt = null;
      }
    }

    if (status !== undefined && status !== post.status) {
      updates.status = status;
    }

    await post.update(updates);

    return res.json(toPostDTO(post));
  } catch (error) {
    console.error('Error al actualizar post:', error);
    return res.status(500).json({ message: 'Error al actualizar post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post || !post.active) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const isAuthor = String(post.authorId ?? '') === String(req.user?.id ?? '');
    const isAdmin = req.user?.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await post.update({ active: false });
    return res.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    return res.status(500).json({ message: 'Error al eliminar post' });
  }
};

module.exports = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
}; 