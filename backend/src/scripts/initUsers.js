const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const users = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // Se hasheará
    role: "admin",
    name: "Administrador Principal"
  },
  {
    id: "2",
    username: "content_manager",
    password: "content123", // Se hasheará
    role: "content_manager",
    name: "Gestor de Contenido"
  },
  {
    id: "3",
    username: "psicologo1",
    password: "psico123", // Se hasheará
    role: "professional",
    name: "Dr. Juan Pérez"
  }
];

async function initUsers() {
  try {
    // Hashear las contraseñas
    const hashedUsers = await Promise.all(users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return {
        ...user,
        password: hashedPassword
      };
    }));

    // Crear el objeto de usuarios
    const usersData = {
      users: hashedUsers
    };

    // Guardar en el archivo
    const filePath = path.join(__dirname, '..', 'data', 'users.json');
    await fs.writeFile(filePath, JSON.stringify(usersData, null, 2));

    console.log('✅ Usuarios inicializados correctamente');
    console.log('\nCredenciales de acceso:');
    users.forEach(user => {
      console.log(`\n👤 ${user.name}`);
      console.log(`   Usuario: ${user.username}`);
      console.log(`   Contraseña: ${user.password}`);
      console.log(`   Rol: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar usuarios:', error);
    process.exit(1);
  }
}

// Ejecutar la inicialización
initUsers(); 