import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TagIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import postsService from '../../services/posts.service';
import { getImageUrl } from '../../utils/imageUtils';

const PostEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams(); // Obtener el ID del post si estamos editando
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    section: 'bienestar',
    status: 'draft',
    thumbnail: null as File | null,
    tags: '',
    featured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const post = await postsService.getPostById(id!);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        section: post.section,
        status: post.status,
        thumbnail: post.thumbnail,
        tags: post.tags?.join(', ') || '',
        featured: post.featured || false,
        seo: {
          metaTitle: post.seo?.metaTitle || '',
          metaDescription: post.seo?.metaDescription || '',
          keywords: post.seo?.keywords || ''
        }
      });
    } catch (error) {
      console.error('Error al cargar el post:', error);
      toast.error('Error al cargar el post');
      navigate('/admin/contenido');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        thumbnail: e.target.files![0]
      }));
    }
  };

  // Determinar la ruta de regreso basada en el rol del usuario
  const getBackPath = () => {
    return user?.role === 'admin' ? '/admin/contenido' : '/content';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section || formData.section === "") {
      toast.error('Debes elegir una categoría para el post.');
      return;
    }
    const categoriaElegida =
      formData.section === 'ninos' ? 'Niños' :
      formData.section === 'adultos' ? 'Adultos' :
      formData.section === 'noticias' ? 'Noticias' : formData.section;
    if (!window.confirm(`¿Estás seguro de crear este post en la sección "${categoriaElegida}"?`)) {
      return;
    }
    setIsSubmitting(true);

    try {
      const postData = new FormData();
      // Procesar los datos básicos
      const { seo, tags, ...basicData } = formData;
      Object.entries(basicData).forEach(([key, value]) => {
        if (value !== null) {
          postData.append(key, value);
        }
      });

      // Procesar tags como array
      const tagsArray = tags.split(',').map(tag => tag.trim());
      postData.append('tags', JSON.stringify(tagsArray));

      // Procesar SEO
      postData.append('seo', JSON.stringify(seo));

      // Añadir datos del autor
      if (!id) { // Solo si es un nuevo post
      postData.append('author', user?.id || '');
      postData.append('authorName', user?.name || '');
      }

      // Generar slug desde el título si es un nuevo post
      if (!id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      postData.append('slug', slug);
      }

      // Calcular tiempo de lectura aproximado (1 min por cada 200 palabras)
      const wordCount = formData.content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min';
      postData.append('readTime', readTime);

      if (id) {
        await postsService.updatePost(id, postData);
        toast.success('Post actualizado exitosamente');
      } else {
      await postsService.createPost(postData);
      toast.success('Post creado exitosamente');
      }
      navigate(getBackPath());
    } catch (error) {
      console.error('Error al guardar post:', error);
      toast.error(id ? 'Error al actualizar el post' : 'Error al crear el post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 mt-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(getBackPath())}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Post' : 'Crear Nuevo Post'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Resumen
            </label>
            <input
              type="text"
              id="excerpt"
              name="excerpt"
              required
              value={formData.excerpt}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              required
              value={formData.content}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="section"
                name="section"
                required
                value={formData.section}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                <option value="ninos">Niños</option>
                <option value="adultos">Adultos</option>
                <option value="noticias">Noticias</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Etiquetas (separadas por comas)
            </label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <TagIcon className="h-5 w-5" />
              </span>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="flex-1 block w-full rounded-none rounded-r-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="ej: psicología, bienestar, salud mental"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured === true || formData.featured === 'true'}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Destacar este post
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Imagen Principal
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {formData.thumbnail ? (
                  <div className="mt-2">
                    <img 
                      src={typeof formData.thumbnail === 'string' ? getImageUrl(formData.thumbnail) : URL.createObjectURL(formData.thumbnail)} 
                      alt="Vista previa" 
                      className="max-h-40 rounded-lg mx-auto"
                    />
                  </div>
                ) : (
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="thumbnail" className="relative cursor-pointer rounded-lg font-medium text-blue-600 hover:text-blue-500">
                    <span>Subir imagen</span>
                    <input
                      id="thumbnail"
                      name="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">SEO</h3>
            <div>
              <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700">
                Título Meta
              </label>
              <input
                type="text"
                id="seo.metaTitle"
                name="seo.metaTitle"
                value={formData.seo.metaTitle}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700">
                Descripción Meta
              </label>
              <textarea
                id="seo.metaDescription"
                name="seo.metaDescription"
                value={formData.seo.metaDescription}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700">
                Palabras Clave
              </label>
              <input
                type="text"
                id="seo.keywords"
                name="seo.keywords"
                value={formData.seo.keywords}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ej: psicología, terapia, salud mental"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(getBackPath())}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Guardando...' : (id ? 'Actualizar Post' : 'Crear Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditor; 