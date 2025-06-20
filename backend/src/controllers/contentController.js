const fs = require('fs');
const path = require('path');

const carouselDir = path.join(__dirname, '../../../public/images/carousel');

// Obtener todas las imágenes del carrusel
exports.getCarouselImages = (req, res) => {
  fs.readdir(carouselDir, (err, files) => {
    if (err) {
      console.error("Error al leer el directorio del carrusel:", err);
      return res.status(500).json({ message: 'No se pudieron cargar las imágenes del carrusel.' });
    }
    // Filtrar por si hay otros archivos que no sean imágenes
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    res.status(200).json(imageFiles);
  });
};

// Eliminar una imagen del carrusel
exports.deleteCarouselImage = (req, res) => {
  const { filename } = req.params;

  // Medida de seguridad para evitar path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ message: 'Nombre de archivo no válido.' });
  }

  const filePath = path.join(carouselDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error al eliminar el archivo ${filename}:`, err);
      // Si el archivo no existe, podría ser un intento de eliminar algo que ya no está.
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'El archivo no fue encontrado.' });
      }
      return res.status(500).json({ message: 'Error al eliminar la imagen.' });
    }
    res.status(200).json({ message: `Imagen '${filename}' eliminada correctamente.` });
  });
}; 