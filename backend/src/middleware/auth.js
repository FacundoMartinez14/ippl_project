const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Para el sistema de mensajes, vamos a permitir el acceso sin autenticación por ahora
  next();
  
  // Cuando implementemos la autenticación completa, usaremos este código:
  /*
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de acceso' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
  */
};

module.exports = {
  authenticateToken
}; 