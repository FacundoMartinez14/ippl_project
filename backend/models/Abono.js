'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Abono extends Model {
    static associate(models) {
      Abono.belongsTo(models.User, {
        foreignKey: 'professionalId',
        as: 'professional',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  }

  Abono.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      professionalId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      professionalName: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Abono',
      tableName: 'Abonos',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Abono;
};
