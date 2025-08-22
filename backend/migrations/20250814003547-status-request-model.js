'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StatusRequests', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      patientId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Patients', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      patientName: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('activation', 'status_change'),
        allowNull: false,
        defaultValue: 'status_change',
      },

      professionalId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      professionalName: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      currentStatus: {
        type: Sequelize.ENUM('active', 'pending', 'inactive', 'absent', 'alta'),
        allowNull: false,
      },
      requestedStatus: {
        type: Sequelize.ENUM('active', 'pending', 'inactive', 'absent', 'alta'),
        allowNull: false,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },

      adminResponse: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    // Índices útiles (lecturas por paciente/profesional/estado)
    await queryInterface.addIndex('StatusRequests', ['professionalId', 'status', 'createdAt'], {
      name: 'idx_statusrequests_professional_status_createdAt',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('StatusRequests', 'idx_statusrequests_professional_status_createdAt');

    // Importante: revertir ENUMs
    await queryInterface.dropTable('StatusRequests');
  },
};
