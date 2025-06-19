export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';
  
  // Si la imagen ya es una URL completa, la devolvemos tal cual
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Si es una ruta relativa, la concatenamos con la URL base
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${imagePath}`;
}; 