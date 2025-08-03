const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const appointmentsRouter = require('./routes/appointments');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const postsRouter = require('./routes/posts');
const professionalsRouter = require('./routes/professionals');
const messagesRouter = require('./routes/messages');
const statsRoutes = require('./routes/stats');
const contentRoutes = require('./routes/content');
const statusRequestsRoutes = require('./routes/statusRequests');
const frequencyRequestsRoutes = require('./routes/frequencyRequests');
const medicalHistoryRouter = require('./routes/medicalHistory');
const activitiesRouter = require('./routes/activities');

const app = express();

// Servir archivos estáticos desde la carpeta 'public' en la raíz del proyecto
app.use(express.static(path.join(__dirname, '../../public')));

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Range']
}));

app.use(express.json());

// Asegurar que las carpetas necesarias existen
const uploadsDir = path.join(__dirname, '..', 'uploads');
const audioUploadsDir = path.join(uploadsDir, 'audios');
const postsUploadsDir = path.join(uploadsDir, 'posts');

[uploadsDir, audioUploadsDir, postsUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configurar middleware para servir archivos estáticos
app.use('/uploads', (req, res, next) => {
  // Configurar CORS para archivos estáticos
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Range');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');

  // Manejar diferentes tipos de archivos de audio
  if (req.path.match(/\.(webm|ogg|mp3|wav)$/)) {
    const extension = path.extname(req.path).toLowerCase();
    const mimeTypes = {
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    };
    
    res.setHeader('Content-Type', mimeTypes[extension]);
    res.setHeader('Accept-Ranges', 'bytes');
  }
  
  next();
}, express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    };
    
    if (mimeTypes[extension]) {
      res.setHeader('Content-Type', mimeTypes[extension]);
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Rutas
app.use('/api/appointments', appointmentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/posts', postsRouter);
app.use('/api/professionals', professionalsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/stats', statsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/status-requests', statusRequestsRoutes);
app.use('/api/frequency-requests', frequencyRequestsRoutes);
app.use('/api/medical-history', medicalHistoryRouter);
app.use('/api/activities', activitiesRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app; 