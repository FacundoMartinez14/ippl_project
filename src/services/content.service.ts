import api from '../config/api';

const getCarouselImages = async (): Promise<string[]> => {
  const response = await api.get('/content/carousel');
  return response.data;
};

const deleteCarouselImage = async (filename: string): Promise<void> => {
  await api.delete(`/content/carousel/${filename}`);
};

const uploadCarouselImage = async (formData: FormData): Promise<void> => {
  await api.post('/api/upload/carousel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const contentManagementService = {
  getCarouselImages,
  deleteCarouselImage,
  uploadCarouselImage,
};

export default contentManagementService; 