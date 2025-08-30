import {useState, useEffect} from 'react';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import postsService, {Post, PostsResponse} from '../../services/posts.service';
import toast from 'react-hot-toast';
import ContentEditorModal from './ContentEditorModal.tsx';
import {log} from "../../utils/log.ts";
import ArrowBackComponent from "../shared/ArrowBackComponent.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import {useParams} from "react-router-dom";

const DEFAULT_POST = {
    title: '',
    content: '',
    section: 'general',
    isPublic: false
}

const ContentManagement = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | undefined>(undefined);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const {user} = useAuth();

    const { id } = useParams<{ id?: string }>();

    const getBackPath = () => {
        return user?.role === 'admin' ? '/admin/contenido' : '/content';
    };


    useEffect(() => {
        postsService.getAllPosts()
            .then((res: PostsResponse) => {
                setPosts(res.posts)
            })
            .catch(err => {
                toast.error('Error al cargar los posts');
                log("error", err, true);
                setPosts([]);
            })
            .finally(() => setIsLoading(false));

        if (id) {
            setEditingPost({ ...DEFAULT_POST, id } as unknown as Post);
        }
    }, [id]);

    const handleSavePost = async (postData: FormData, id?: string) => {
        const toasterMessages = {
            successCreate: 'Post creado correctamente',
            successEdit: 'Post actualizado correctamente',
            errorCreate: 'Error al crear el post',
            errorEdit: 'Error al actualizar el post'
        }
        try {
            if (id) {
                const updatedPost = await postsService.updatePost(id, postData);
                setPosts(posts.map(p => p.id === id ? updatedPost : p));
                toast.success(toasterMessages.successEdit);
            } else {
                const newPost = await postsService.createPost(postData);
                setPosts([newPost.post, ...posts]);
                toast.success(toasterMessages.successCreate);
            }
            setSelectedPost(undefined);
        } catch (error) {
            toast.error(selectedPost ? toasterMessages.errorEdit : toasterMessages.errorCreate);
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
                log("error", error, true);
            }
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
            <div className="flex items-center mb-6">
                <ArrowBackComponent url={getBackPath()}/>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Contenido</h1>
            </div>
            {/* SECCIÓN: GESTIÓN DE POSTS */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-5 text-gray-700">Gestión de Posts del Blog</h2>
                {editingPost &&
                    <div>
                        <ContentEditorModal
                            postid={editingPost.id}
                            onSave={handleSavePost}
                            user={user}
                            closeModal={setEditingPost}
                        />
                    </div>
                }
                <div>
                    <button
                        onClick={() => setEditingPost(DEFAULT_POST as unknown as Post)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-6 shadow"
                    >
                        Crear Nuevo Post
                    </button>
                    {isLoading
                        ? <p>Cargando posts...</p>
                        : <div className="space-y-4">
                            {posts.map(post => (
                                <div key={post.id}
                                     className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{post.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()} - <span className={'font-semibold text-green-600'}>Público</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => setEditingPost(post)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors" aria-label="Editar post">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDelete(post.id as string)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors" aria-label="Eliminar post">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default ContentManagement;