import React, { useState, useEffect } from 'react';
import postsService, { Post } from '../services/posts.service';
import { CalendarIcon, EyeIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

const BlogPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [viewedPosts, setViewedPosts] = useState<{ [key: string]: boolean }>({});
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
    loadPosts();
  }, []);

  useEffect(() => {
    if (user && posts.length > 0) {
      checkLikedPosts();
      checkViewedPosts();
    }
  }, [user, posts]);

  const checkLikedPosts = async () => {
    try {
      const likedStatus: { [key: string]: boolean } = {};
      for (const post of posts) {
        const isLiked = await postsService.checkIfLiked(post.id);
        likedStatus[post.id] = isLiked;
      }
      setLikedPosts(likedStatus);
    } catch (error) {
      console.error('Error al verificar likes:', error);
    }
  };

  const checkViewedPosts = async () => {
    try {
      const viewedStatus: { [key: string]: boolean } = {};
      for (const post of posts) {
        const isViewed = await postsService.checkIfViewed(post.id);
        viewedStatus[post.id] = isViewed;
      }
      setViewedPosts(viewedStatus);
    } catch (error) {
      console.error('Error al verificar vistas:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsService.getAllPosts();
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    if (!user || viewedPosts[post.id]) return;

    try {
      const { views } = await postsService.incrementViews(post.id);
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, views } : p
      ));
      setViewedPosts(prev => ({
        ...prev,
        [post.id]: true
      }));
    } catch (error) {
      console.error('Error al incrementar vistas:', error);
    }
  };

  const handleLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }
    if (isLiking) return;

    try {
      setIsLiking(true);
      const { likes, isLiked } = await postsService.toggleLike(postId);
      
      // Actualizar el contador de likes y el estado del like en la lista de posts
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes } : post
      ));
      setLikedPosts(prev => ({
        ...prev,
        [postId]: isLiked
      }));

      // Actualizar el post seleccionado si está abierto
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, likes } : null);
      }

      toast.success(isLiked ? '¡Gracias por tu like!' : 'Like removido');
    } catch (error) {
      console.error('Error al gestionar like:', error);
      toast.error('Error al gestionar el like');
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16" data-aos="fade-up">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Blog IPPL
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Artículos, noticias y recursos sobre psicología y salud mental
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <article
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            data-aos="zoom-in-up"
            data-aos-delay={idx * 100}
          >
            {post.thumbnail && (
              <img 
                src={getImageUrl(post.thumbnail)} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#00796B]">
                {post.title}
              </h2>

              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {post.views || 0}
                  </span>
                  <button
                    onClick={(e) => handleLike(post.id, e)}
                    className={`flex items-center transition-colors ${
                      likedPosts[post.id] 
                        ? 'text-[#00796B] hover:text-[#006C73]' 
                        : 'text-gray-500 hover:text-[#00796B]'
                    }`}
                  >
                    {likedPosts[post.id] ? (
                      <HeartSolidIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <HeartIcon className="h-4 w-4 mr-1" />
                    )}
                    {post.likes || 0}
                  </button>
                </div>
                <span className="text-[#00796B]">
                  {post.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal de Post */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transform hover:scale-110 transition-all duration-200 z-50"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <article className="p-6">
              {selectedPost.thumbnail && (
                <div className="relative w-full h-[500px] mb-8">
                  <img
                    src={getImageUrl(selectedPost.thumbnail)}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPost.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-8">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {selectedPost.views || 0} vistas
                  </span>
                  <button
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    className={`flex items-center transition-colors ${
                      likedPosts[selectedPost.id] 
                        ? 'text-[#00796B] hover:text-[#006C73]' 
                        : 'text-gray-500 hover:text-[#00796B]'
                    }`}
                  >
                    {likedPosts[selectedPost.id] ? (
                      <HeartSolidIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <HeartIcon className="h-4 w-4 mr-1" />
                    )}
                    {selectedPost.likes || 0} likes
                  </button>
                </div>
                <span className="text-[#00796B]">
                  {selectedPost.readTime}
                </span>
              </div>

              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage; 