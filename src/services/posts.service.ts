import api from '../config/api';
import { AxiosResponse } from 'axios';
import activityService from './activity.service';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  section: string;
  status: 'draft' | 'published';
  thumbnail?: string;
  tags: string[];
  author: string;
  authorName: string;
  featured: boolean;
  readTime: string;
  views: number;
  likes: number;
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    status: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PostsResponse {
  posts: Post[];
}

interface PostResponse {
  post: Post;
}

class PostsService {
  private baseUrl = import.meta.env.VITE_API_URL + '/api/posts';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión.');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async getAllPosts(): Promise<{ posts: Post[] }> {
    return this.request<{ posts: Post[] }>('');
  }

  async createPost(postData: FormData): Promise<Post> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: postData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        throw new Error('Error al crear el post');
      }

      const post = await response.json();
      await activityService.logActivity({
        type: 'new_post',
        description: `Nuevo artículo publicado: "${post.title}"`,
        actor: post.authorName || 'Sistema'
      });
      return post;
    } catch (error) {
      console.error('Error al crear post:', error);
      throw error;
    }
  }

  async updatePost(id: string, postData: FormData): Promise<Post> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: postData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        throw new Error('Error al actualizar el post');
      }

      const post = await response.json();
      await activityService.logActivity({
        type: 'post_update',
        description: `Artículo actualizado: "${post.title}"`,
        actor: post.authorName || 'Sistema'
      });
      return post;
    } catch (error) {
      console.error('Error al actualizar post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.request(`/${id}`, { method: 'DELETE' });
  }

  async getPostById(id: string): Promise<Post> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión.');
      }
      if (response.status === 404) {
        throw new Error('Post no encontrado');
      }
      throw new Error('Error al obtener el post');
    }
    return response.json();
  }

  async toggleLike(id: string): Promise<{ likes: number; isLiked: boolean }> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/toggle-like`, {
      method: 'POST',
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión.');
      }
      throw new Error('Error al gestionar el like del post');
    }
    return response.json();
  }

  async checkIfLiked(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/check-like`, {
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión.');
      }
      throw new Error('Error al verificar el like del post');
    }
    const data = await response.json();
    return data.isLiked;
  }

  async checkIfViewed(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/check-view`, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Error al verificar vista del post');
    }
    const data = await response.json();
    return data.isViewed;
  }

  async incrementViews(id: string): Promise<{ views: number; isViewed: boolean }> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}/increment-view`, {
      method: 'POST',
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Error al incrementar las vistas del post');
    }
    return response.json();
  }

  async getStats(): Promise<any> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Error al obtener las estadísticas');
    }
    return response.json();
  }
}

export default new PostsService(); 