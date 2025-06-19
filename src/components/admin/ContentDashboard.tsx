import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import postsService, { Post } from '../../services/posts.service';
import { getImageUrl } from '../../utils/imageUtils';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ChartBarIcon,
  NewspaperIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  BookmarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostModal from './PostModal';

const ContentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsService.getAllPosts();
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error al cargar posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
    toast.success('Contenido actualizado');
  };

  const getPostStats = () => {
    const published = posts.filter(p => p.status === 'published').length;
    const draft = posts.filter(p => p.status === 'draft').length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    
    return { published, draft, totalViews, totalLikes };
  };

  const stats = getPostStats();

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await postsService.deletePost(postToDelete.id);
      setPosts(posts.filter(p => p.id !== postToDelete.id));
      toast.success('Post eliminado correctamente');
      setPostToDelete(null);
    } catch (error) {
      console.error('Error al eliminar post:', error);
      toast.error('Error al eliminar el post');
    }
  };

  const handleOpenModal = (post?: Post) => {
    let prefix = '/content';
    if (user?.role === 'admin') prefix = '/admin/contenido';
    if (post) {
      navigate(`${prefix}/editar/${post.id}`);
    } else {
      navigate(`${prefix}/nuevo`);
    }
  };

  const handleCloseModal = () => {
    setSelectedPost(undefined);
    setIsModalOpen(false);
  };

  const handleSavePost = async (postData: any) => {
    try {
      if (selectedPost) {
        const updatedPost = await postsService.updatePost(selectedPost.id, postData);
        setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
        toast.success('Post actualizado correctamente');
      } else {
        const newPost = await postsService.createPost(postData);
        setPosts([newPost, ...posts]);
        toast.success('Post creado correctamente');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(selectedPost ? 'Error al actualizar el post' : 'Error al crear el post');
    }
  };

  const handleUpload = async (e) => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setMessage("Selecciona una imagen primero.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload/carousel", {
        method: "POST",
        headers: {
          // Si usas autenticación por token, agrega aquí el header Authorization
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Imagen subida exitosamente.");
        setPreview(null);
        fileInputRef.current.value = null;
      } else {
        setMessage(data.message || "Error al subir la imagen.");
      }
    } catch (err) {
      setMessage("Error de red al subir la imagen.");
    }
    setUploading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-16 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard de Contenido
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona el contenido del blog
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Post
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-gray-500">Posts Publicados</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{stats.published}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <BookmarkIcon className="h-6 w-6 text-yellow-600" />
              <span className="ml-2 text-sm font-medium text-gray-500">Borradores</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{stats.draft}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <EyeIcon className="h-6 w-6 text-green-600" />
              <span className="ml-2 text-sm font-medium text-gray-500">Total Vistas</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{stats.totalViews}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <HeartIcon className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-sm font-medium text-gray-500">Total Likes</span>
              </div>
            <div className="mt-2 text-2xl font-semibold">{stats.totalLikes}</div>
            </div>
          </div>
        </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar posts..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">Todas las secciones</option>
                <option value="bienestar">Bienestar</option>
                <option value="salud-mental">Salud Mental</option>
                <option value="psicologia">Psicología</option>
                <option value="noticias">Noticias</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">Todos los estados</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
              </select>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-400 hover:text-gray-500 rounded-lg ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {post.thumbnail ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={getImageUrl(post.thumbnail)}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <NewspaperIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.excerpt?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{post.section}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(post)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar Post
            </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
            </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
              <button
                  type="button"
                onClick={() => setPostToDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Manager */}
      <CarouselManager />
    </div>
  );
};

const CarouselManager = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setMessage("Selecciona una imagen primero.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload/carousel", {
        method: "POST",
        headers: {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Imagen subida exitosamente.");
        setPreview(null);
        fileInputRef.current.value = null;
      } else {
        setMessage(data.message || "Error al subir la imagen.");
      }
    } catch (err) {
      setMessage("Error de red al subir la imagen.");
    }
    setUploading(false);
  };

  return (
    <div className="my-8 p-8 bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full">
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold mb-2 text-left">Gestión de Carrusel de Imágenes</h2>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
          {preview && (
            <img src={preview} alt="Previsualización" className="mt-4 rounded-xl shadow-md max-h-32 object-contain border border-gray-200" />
          )}
        </div>
        <div className="flex-1 w-full flex flex-col items-end">
          <label className="block text-xl font-bold mb-2 text-right">Selecciona una imagen</label>
          <button onClick={handleUpload} disabled={uploading} className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg shadow hover:bg-blue-700 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {uploading ? "Subiendo..." : "Subir Imagen"}
          </button>
          {message && <p className="mt-2 text-sm text-gray-700 text-right">{message}</p>}
        </div>
      </div>
      {/* Aquí se mostraría la lista de imágenes actuales del carrusel */}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, textColor }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className={`h-6 w-6 ${textColor}`} />
      </div>
      <div className="ml-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  </div>
);

export default ContentDashboard; 