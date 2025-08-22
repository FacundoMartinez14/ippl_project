'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MedicalHistories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'), // Si usas MySQL 8; en Postgres podrías usar gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      patientId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // no se borran pacientes físicamente
      },
      professionalId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // si se borra el profesional, preservamos el historial
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      treatment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    // Índices útiles
    await queryInterface.addIndex('MedicalHistories', ['patientId', 'date'], {
      name: 'idx_medhist_patient_date',
    });
    await queryInterface.addIndex('MedicalHistories', ['professionalId', 'date'], {
      name: 'idx_medhist_professional_date',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('MedicalHistories', 'idx_medhist_professional_date');
    await queryInterface.removeIndex('MedicalHistories', 'idx_medhist_patient_date');
    await queryInterface.dropTable('MedicalHistories');
  },
};
