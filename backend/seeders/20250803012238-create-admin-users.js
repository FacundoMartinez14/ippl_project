'use strict';
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs');
module.exports = {
  async up (queryInterface, Sequelize) {
    const adminhash = await bcrypt.hash('Gorischnik1234', 10);
    const supporthash = await bcrypt.hash('Password1', 10);
    await queryInterface.bulkInsert('Users', [{
      name: 'Roberta Gorischnik',
      email: 'robertagoris@gmail.com',
      password: adminhash,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Facundo Martinez',
      email: 'facundo.eet2@gmail.com',
      password: supporthash,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    // Elimina los dos usuarios por su email
    await queryInterface.bulkDelete(
      'Users',
      {
        email: {
          [Sequelize.Op.in]: [
            'robertagoris@gmail.com',
            'facundo.eet2@gmail.com'
          ]
        }
      },
      {}
    );
  }
};
