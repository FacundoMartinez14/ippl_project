import api from '../config/api';

const getCarouselImages = async (): Promise<string[]> => {
  const response = await api.get('/content/carousel');
  return response.data;
};

const deleteCarouselImage = async (filename: string): Promise<void> => {
  await api.delete(`/content/carousel/${filename}`);
};

const contentManagementService = {
  getCarouselImages,
  deleteCarouselImage,
};

export default contentManagementService; 