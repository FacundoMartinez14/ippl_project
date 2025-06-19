const fs = require('fs');
const path = require('path');

// Función para crear directorios de forma recursiva
function createDirectories() {
  const directories = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'uploads', 'audios'),
    path.join(__dirname, 'data')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    } else {
      console.log(`👍 Directorio ya existe: ${dir}`);
    }
  });
}

// Ejecutar la creación de directorios
try {
  createDirectories();
  console.log('🚀 Setup completado exitosamente!');
} catch (error) {
  console.error('❌ Error durante el setup:', error);
  process.exit(1);
} 