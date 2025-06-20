import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import postsService, { Post } from '../../services/posts.service';
import toast from 'react-hot-toast';
import PostModal from './PostModal';
import contentManagementService from '../../services/content.service';
import PostEditor from './PostEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ContentManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPosts();
    fetchCarouselImages();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsService.getAllPosts();
      setPosts(response.posts || []);
    } catch (error) {
      toast.error('Error al cargar los posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const images = await contentManagementService.getCarouselImages();
      setCarouselImages(images);
    } catch (error) {
      toast.error('No se pudieron cargar las imágenes del carrusel.');
      console.error(error);
    }
  };

  const handleOpenModal = (post?: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(undefined);
    setIsModalOpen(false);
  };

  const handleSavePost = async (postData: Partial<Post>) => {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        await postsService.deletePost(id);
        toast.success('Post eliminado correctamente');
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        toast.error('Error al eliminar el post');
      }
    }
  };

  const handlePostSaved = () => {
    setEditingPost(null);
    loadPosts();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('carouselImages', files[i]);
    }

    setIsUploading(true);
    toast.loading('Subiendo imágenes...');

    try {
      await postsService.uploadCarouselImages(formData);
      toast.dismiss();
      toast.success('Imágenes subidas correctamente!');
      fetchCarouselImages(); // Recargar la lista de imágenes
    } catch (error) {
      toast.dismiss();
      toast.error('Error al subir las imágenes.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCarouselImage = async (filename: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la imagen "${filename}"?`)) {
      return;
    }
    
    toast.loading('Eliminando imagen...');
    try {
      await contentManagementService.deleteCarouselImage(filename);
      toast.dismiss();
      toast.success('Imagen eliminada.');
      setCarouselImages(prev => prev.filter(img => img !== filename));
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo eliminar la imagen.');
      console.error(error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !sectionFilter || post.section === sectionFilter;
    const matchesStatus = !statusFilter || post.status === statusFilter;
    return matchesSearch && matchesSection && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 mt-16">
      <h1 className="text-3xl font-bold text-gray-800">Gestión de Contenido</h1>
      
      {/* SECCIÓN: GESTIÓN DEL CARRUSEL */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-5 text-gray-700">Gestión del Carrusel de Inicio</h2>
        <div className="mb-6">
          <label htmlFor="carouselUpload" className="block text-sm font-medium text-gray-600 mb-2">
            Subir nuevas imágenes para el carrusel (se aceptan múltiples archivos)
          </label>
          <input 
            type="file" 
            id="carouselUpload"
            multiple 
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          />
          {isUploading && <p className="text-sm text-blue-500 mt-2">Subiendo imágenes, por favor espera...</p>}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-4">Imágenes Actuales en el Carrusel</h3>
          {carouselImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {carouselImages.map(imageFile => (
                <div key={imageFile} className="relative group rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={`${API_URL}/images/carousel/${imageFile}`} 
                    alt={`Imagen del carrusel: ${imageFile}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteCarouselImage(imageFile)}
                      className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300"
                      aria-label={`Eliminar imagen ${imageFile}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No hay imágenes en el carrusel.</p>
              <p className="text-sm text-gray-400 mt-1">Sube una imagen para empezar.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: GESTIÓN DE POSTS */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-5 text-gray-700">Gestión de Posts del Blog</h2>
        {editingPost ? (
          <div>
            <h3 className="text-xl mb-4 font-semibold text-gray-600">{editingPost.id ? 'Editando Post' : 'Creando Nuevo Post'}</h3>
            <PostEditor post={editingPost} onSave={handlePostSaved} onCancel={() => setEditingPost(null)} />
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setEditingPost({ title: '', content: '', section: 'general', isPublic: false } as Post)} 
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-6 shadow"
            >
              Crear Nuevo Post
            </button>
            {isLoading ? <p>Cargando posts...</p> : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{post.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()} - <span className={`font-semibold ${post.isPublic ? 'text-green-600' : 'text-yellow-600'}`}>{post.isPublic ? 'Público' : 'Oculto'}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setEditingPost(post)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors" aria-label="Editar post">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                       <button onClick={() => handleDelete(post.id as string)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors" aria-label="Eliminar post">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePost}
        post={selectedPost}
      />
    </div>
  );
};

export default ContentManagement;