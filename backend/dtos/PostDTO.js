'use strict';

function toIso(value) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

class PostDTO {
  constructor(src) {
    const p = typeof src.get === 'function' ? src.get({ plain: true }) : src;
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

    this.id = String(p.id);
    this.title = p.title;
    this.slug = p.slug;
    this.content = p.content;
    this.excerpt = p.excerpt;
    this.section = p.section;
    this.status = p.status; // 'draft' | 'published'
    this.thumbnail = p.thumbnail
      ? `${BASE_URL}/uploads/posts/${p.thumbnail}`
      : undefined;

    // Arrays / objetos con defaults seguros
    this.tags = Array.isArray(p.tags) ? p.tags : [];
    this.seo = {
      metaTitle: p.seo?.metaTitle ?? '',
      metaDescription: p.seo?.metaDescription ?? '',
      keywords: p.seo?.keywords ?? '',
    };

    // Autor según contrato del cliente
    this.author = p.authorId != null ? String(p.authorId) : '';
    this.authorName = p.authorName ?? '';

    // Booleans / números
    this.featured = !!p.featured;
    this.readTime = p.readTime ?? '1 min';
    this.views = Number(p.views ?? 0);
    this.likes = Number(p.likes ?? 0);

    // Comentarios (JSON)
    this.comments = Array.isArray(p.comments) ? p.comments : [];

    // Fechas ISO
    this.createdAt = toIso(p.createdAt);
    this.updatedAt = toIso(p.updatedAt);
    this.publishedAt = toIso(p.publishedAt);
  }
}

module.exports = PostDTO;