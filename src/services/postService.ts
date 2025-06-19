export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  thumbnail?: string;
  author: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  section: 'ninos' | 'adultos' | 'noticias';
  status?: 'draft' | 'published';
  tags?: string[];
  featured?: boolean;
  readTime?: string;
  views?: number;
  likes?: number;
  comments?: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    status: string;
  }[];
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
  const postRef = collection(db, 'posts');
  const newPost = {
    ...postData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(postRef, newPost);
  return { id: docRef.id, ...newPost };
};

export const getPosts = async (section?: string) => {
  const postsRef = collection(db, 'posts');
  let q = query(postsRef, orderBy('createdAt', 'desc'));
  
  if (section) {
    q = query(postsRef, where('section', '==', section), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[];
}; 