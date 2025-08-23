'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      title: { type: Sequelize.STRING(200), allowNull: false },
      slug:  { type: Sequelize.STRING(200), allowNull: false, unique: true },

      content: { type: Sequelize.TEXT, allowNull: false },
      excerpt: { type: Sequelize.STRING(300), allowNull: false },

      section: { type: Sequelize.STRING(100), allowNull: false },

      status: {
        type: Sequelize.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft',
      },

      thumbnail: { type: Sequelize.STRING(255), allowNull: true },

      tags: { type: Sequelize.JSON, allowNull: true },
      seo:  { type: Sequelize.JSON, allowNull: true },

      authorId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      authorName: { type: Sequelize.STRING(150), allowNull: true },

      featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      readTime: { type: Sequelize.STRING(50), allowNull: false, defaultValue: '1 min' },

      views: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      likes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },

      comments: { type: Sequelize.JSON, allowNull: true },
      likedBy:  { type: Sequelize.JSON, allowNull: true },
      viewedBy: { type: Sequelize.JSON, allowNull: true },

      publishedAt: { type: Sequelize.DATE, allowNull: true },

      active:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('Posts', ['authorId', 'createdAt'], {
      name: 'idx_posts_author_createdAt',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Posts', 'idx_posts_author_createdAt');
    await queryInterface.dropTable('Posts');
  },
};
