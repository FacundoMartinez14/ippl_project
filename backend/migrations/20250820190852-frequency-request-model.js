// migrations/XXXXXXXXXXXX-create-frequency-requests.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FrequencyRequests', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      patientName: {
        type: Sequelize.STRING(150),
        allowNull: false,
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
        allowNull: false,
      },
      currentFrequency: {
        type: Sequelize.ENUM('weekly', 'biweekly', 'monthly'),
        allowNull: false,
      },
      requestedFrequency: {
        type: Sequelize.ENUM('weekly', 'biweekly', 'monthly'),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Índices
    await queryInterface.addIndex('FrequencyRequests', ['patientId', 'createdAt'], { name: 'idx_freqreq_patient_created' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('FrequencyRequests', 'idx_freqreq_patient_created');

    // Borrar enums primero en algunos dialectos (ej. Postgres)
    await queryInterface.dropTable('FrequencyRequests');
  },
};
