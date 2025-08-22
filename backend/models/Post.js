'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Autor opcional (snapshot authorName queda en la fila)
      Post.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'authorUser',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Post.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      title: { type: DataTypes.STRING(200), allowNull: false },
      slug:  { type: DataTypes.STRING(200), allowNull: false, unique: true },

      content: { type: DataTypes.TEXT, allowNull: false },
      excerpt: { type: DataTypes.STRING(300), allowNull: false },

      section: { type: DataTypes.STRING(100), allowNull: false },

      status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft',
      },

      thumbnail: { type: DataTypes.STRING(255), allowNull: true },

      tags: { type: DataTypes.JSON, allowNull: true },          // string[]
      seo:  { type: DataTypes.JSON, allowNull: true },          // { metaTitle, metaDescription, keywords }

      authorId:   { type: DataTypes.BIGINT, allowNull: true },  // FK a Users.id
      authorName: { type: DataTypes.STRING(150), allowNull: true }, // snapshot

      featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

      readTime: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '1 min' },

      views: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      likes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },

      comments: { type: DataTypes.JSON, allowNull: true },      // array de comentarios (JSON)
      likedBy:  { type: DataTypes.JSON, allowNull: true },      // string[]
      viewedBy: { type: DataTypes.JSON, allowNull: true },      // string[]

      publishedAt: { type: DataTypes.DATE, allowNull: true },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'Posts',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      hooks: {
        beforeCreate(post) {
          post.publishedAt = post.status === 'published' ? new Date() : null;
        },
        beforeUpdate(post) {
          if (post.changed('status')) {
            if (post.status === 'published') {
              if (!post.publishedAt) post.publishedAt = new Date();
            } else if (post.status === 'draft') {
              post.publishedAt = null;
            }
          }
        },
      },
    }
  );

  return Post;
};
