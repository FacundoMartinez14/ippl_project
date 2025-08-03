const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const ABONOS_FILE = path.join(__dirname, '../data/abonos.json');

// Helper function to read users
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    return [];
  }
}

// Helper function to write users
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// Helper function to read abonos
async function readAbonos() {
  try {
    const data = await fs.readFile(ABONOS_FILE, 'utf8');
    return JSON.parse(data).abonos || [];
  } catch (error) {
    return [];
  }
}

// Helper function to write abonos
async function writeAbonos(abonos) {
  await fs.writeFile(ABONOS_FILE, JSON.stringify({ abonos }, null, 2));
}

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await readUsers();
    // No enviar las contraseñas al frontend
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json({ users: safeUsers });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const users = await readUsers();

    // Verificar si el email ya existe
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);

    // No enviar la contraseña en la respuesta
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está actualizando la contraseña, encriptarla
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await writeUsers(users);

    // No enviar la contraseña en la respuesta
    const { password: _, ...safeUser } = users[userIndex];
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar el usuario completamente
    users.splice(userIndex, 1);

    await writeUsers(users);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// Abonar comisión a un profesional
const abonarComision = async (req, res) => {
  try {
    const { id } = req.params;
    const { abono } = req.body;
    if (!abono || isNaN(abono) || abono <= 0) {
      return res.status(400).json({ message: 'Abono inválido' });
    }
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id && user.role === 'professional');
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }
    if (!users[userIndex].saldoPendiente) users[userIndex].saldoPendiente = 0;
    users[userIndex].saldoPendiente += abono;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsers(users);

    // Guardar abono individual
    const abonos = await readAbonos();
    abonos.push({
      id: Date.now().toString(),
      professionalId: users[userIndex].id,
      professionalName: users[userIndex].name,
      amount: abono,
      date: new Date().toISOString()
    });
    await writeAbonos(abonos);

    res.json({ success: true, saldoPendiente: users[userIndex].saldoPendiente });
  } catch (error) {
    console.error('Error al abonar comisión:', error);
    res.status(500).json({ message: 'Error al abonar comisión' });
  }
};

// Obtener todos los abonos individuales
const getAbonos = async (req, res) => {
  try {
    const abonos = await readAbonos();
    res.json({ abonos });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener abonos' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  abonarComision,
  getAbonos
}; 