import React, { useEffect, useState } from 'react';
import postsService, { Post } from '../services/posts.service';
import PostCard from '../components/PostCard';
import { CalendarIcon, EyeIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

const BlogNoticiasPage = () => {
  const { user } = useAuth ? useAuth() : { user: null };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [viewedPosts, setViewedPosts] = useState<{ [key: string]: boolean }>({});
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
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
      setLoading(true);
      const response = await postsService.getAllPosts();
      const noticiasPosts = response.posts.filter((p: Post) => p.section === 'noticias');
      setPosts(noticiasPosts);
    } catch (error) {
      console.error('Error al cargar los posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    if (!user || viewedPosts[post.id]) return;
    try {
      const { views } = await postsService.incrementViews(post.id);
      setPosts(posts.map(p => p.id === post.id ? { ...p, views } : p));
      setViewedPosts(prev => ({ ...prev, [post.id]: true }));
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
      setPosts(posts.map(post => post.id === postId ? { ...post, likes } : post));
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <p>Cargando posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-[#374151]">Blog: Noticias</h1>
      {posts.length === 0 ? (
        <p className="text-lg text-gray-600">No hay posts disponibles en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={handlePostClick}
              onLike={handleLike}
              liked={likedPosts[post.id]}
            />
          ))}
        </div>
      )}
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
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                        ? 'text-pink-600 hover:text-pink-700'
                        : 'text-gray-500 hover:text-pink-600'
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
                <span className="text-blue-600">
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

export default BlogNoticiasPage; 