const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Lee el archivo de usuarios
    const usersData = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    const users = JSON.parse(usersData).users;
    
    // Encuentra el usuario por username o email
    const user = users.find(u => u.email === username || u.username === username);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    // Verifica la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    // Genera el token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Actualizar último login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    await fs.writeFile(
      path.join(__dirname, '../data/users.json'),
      JSON.stringify({ users: updatedUsers }, null, 2)
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = {
  login,
  verifyToken
}; 