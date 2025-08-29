import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import postsService, { Post } from '../../services/posts.service';
import toast from 'react-hot-toast';
import PostModal from './PostModal';
import contentManagementService from '../../services/content.service';
import PostEditor from './PostEditor';
import {log} from "../../utils/log.ts";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ContentManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      log("error", error, true);
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

  const handleCloseModal = () => {
    setSelectedPost(undefined);
    setIsModalOpen(false);
  };

  const handleSavePost = async (postData: FormData) => {
    try {
      if (selectedPost) {
        const updatedPost = await postsService.updatePost(selectedPost.id, postData);
        setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
        toast.success('Post actualizado correctamente');
      } else {
        const newPost = await postsService.createPost(postData);
        setPosts([newPost.post, ...posts]);
        toast.success('Post creado correctamente');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(selectedPost ? 'Error al actualizar el post' : 'Error al crear el post');
      log("error", error, true);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('image', files[0]);

    setIsUploading(true);
    toast.loading('Subiendo imagen...');

    try {
      await contentManagementService.uploadCarouselImage(formData);
      toast.dismiss();
      toast.success('Imagen subida correctamente!');
      fetchCarouselImages();
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al subir la imagen.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCarouselImage = async (filename: string) => {
    setImageToDelete(filename);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    
    toast.loading('Eliminando imagen...');
    try {
      await contentManagementService.deleteCarouselImage(imageToDelete);
      toast.dismiss();
      toast.success('Imagen eliminada.');
      setCarouselImages(prev => prev.filter(img => img !== imageToDelete));
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo eliminar la imagen.');
      console.error(error);
    } finally {
      setIsDeleteModalOpen(false);
      setImageToDelete(null);
    }
  };

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
            Subir nuevas imágenes para el carrusel
          </label>
          <input 
            type="file" 
            id="carouselUpload"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          />
          {isUploading && <p className="text-sm text-blue-500 mt-2">Subiendo imagen, por favor espera...</p>}
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

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
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
                      Eliminar imagen del carrusel
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDeleteImage}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setImageToDelete(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN: GESTIÓN DE POSTS */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-5 text-gray-700">Gestión de Posts del Blog</h2>
        {editingPost ? (
          <div>
            <h3 className="text-xl mb-4 font-semibold text-gray-600">{editingPost.id ? 'Editando Post' : 'Creando Nuevo Post'}</h3>
            <PostEditor />
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setEditingPost({title: '', content: '', section: 'general', isPublic: false} as unknown as Post)}
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
                        {new Date(post.createdAt).toLocaleDateString()} - <span className={'font-semibold text-green-600'}>Público</span>
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