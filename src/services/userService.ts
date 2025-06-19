import api from '../config/api';

const USERS_STORAGE_KEY = 'app_users';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): boolean => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
    return false;
  }
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await api.delete(`/users/${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}; 