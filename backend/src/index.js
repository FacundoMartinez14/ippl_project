const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const app = require('./app');
const { sequelize } = require('../models');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Asegurarse de que los directorios existan
async function ensureDirectories() {
  const directories = [
    path.join(__dirname, 'data'),
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'uploads', 'audios'),
    path.join(__dirname, '..', 'uploads', 'documents'),
    path.join(__dirname, '..', 'uploads', 'images')
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  }
}

// Configuración para almacenar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '..', 'uploads');
    
    // Determinar la subcarpeta según el tipo de archivo
    if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(uploadPath, 'audios');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadPath, 'documents');
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadPath, 'images');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const patientRoutes = require('./routes/patients');
const statsRoutes = require('./routes/stats');
const appointmentsRoutes = require('./routes/appointments');
const professionalsRoutes = require('./routes/professionals');
const activitiesRoutes = require('./routes/activities');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/activities', activitiesRoutes);

// Ruta específica para subir archivos de audio
app.post('/api/upload/audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo de audio' });
  }
  
  const fileUrl = `/uploads/audios/${req.file.filename}`;
  res.json({ 
    message: 'Audio subido correctamente',
    url: fileUrl
  });
});

// Ruta general para subir archivos
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    message: 'Archivo subido correctamente',
    fileUrl: fileUrl
  });
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await ensureDirectories();
    await sequelize.authenticate();
+   console.log('✅ [DB] Conectada correctamente');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer(); 