const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyToken } = require('../controllers/authController');

// GET /api/professionals - Obtener todos los profesionales
router.get('/', async (req, res) => {
  try {
    console.log('Intentando leer el archivo users.json...');
    const filePath = path.join(__dirname, '../data/users.json');
    console.log('Ruta del archivo:', filePath);
    
    const data = await fs.readFile(filePath, 'utf8');
    console.log('Archivo leído correctamente');
    
    const users = JSON.parse(data);
    console.log('Total de usuarios:', users.users.length);
    
    const professionals = users.users.filter(user => user.role === 'professional');
    console.log('Profesionales encontrados:', professionals.length);
    
    res.json({ professionals });
  } catch (error) {
    console.error('Error detallado al obtener profesionales:', error);
    res.status(500).json({ message: 'Error al obtener los profesionales' });
  }
});

// GET /api/professionals/:id - Obtener un profesional por ID
router.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    const users = JSON.parse(data);
    const professional = users.users.find(u => u.id === req.params.id && u.role === 'professional');
    
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }
    
    res.json(professional);
  } catch (error) {
    console.error('Error al obtener profesional:', error);
    res.status(500).json({ message: 'Error al obtener el profesional' });
  }
});

// POST /api/professionals - Crear un nuevo profesional (protegido)
router.post('/', verifyToken, async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    const users = JSON.parse(data);
    
    const newProfessional = {
      id: Date.now().toString(),
      ...req.body,
      role: 'professional',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      status: 'active',
      permissions: ['manage_patients', 'create_notes']
    };
    
    users.users.push(newProfessional);
    
    await fs.writeFile(
      path.join(__dirname, '../data/users.json'),
      JSON.stringify(users, null, 2)
    );
    
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error('Error al crear profesional:', error);
    res.status(500).json({ message: 'Error al crear el profesional' });
  }
});

// PUT /api/professionals/:id - Actualizar un profesional (protegido)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    const users = JSON.parse(data);
    const index = users.users.findIndex(u => u.id === req.params.id && u.role === 'professional');
    
    if (index === -1) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }
    
    // No permitir cambiar campos sensibles
    const { password, role, ...updateData } = req.body;
    
    const updatedProfessional = {
      ...users.users[index],
      ...updateData,
      role: 'professional', // Asegurar que el rol no cambie
    };
    
    users.users[index] = updatedProfessional;
    
    await fs.writeFile(
      path.join(__dirname, '../data/users.json'),
      JSON.stringify(users, null, 2)
    );
    
    res.json(updatedProfessional);
  } catch (error) {
    console.error('Error al actualizar profesional:', error);
    res.status(500).json({ message: 'Error al actualizar el profesional' });
  }
});

// DELETE /api/professionals/:id - Eliminar un profesional (protegido)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    const users = JSON.parse(data);
    const index = users.users.findIndex(u => u.id === req.params.id && u.role === 'professional');
    
    if (index === -1) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }
    
    users.users.splice(index, 1);
    
    await fs.writeFile(
      path.join(__dirname, '../data/users.json'),
      JSON.stringify(users, null, 2)
    );
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar profesional:', error);
    res.status(500).json({ message: 'Error al eliminar el profesional' });
  }
});

module.exports = router; 