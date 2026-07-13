'use strict';

const { DataTypes } = require('sequelize');
const { connect } = require('../../modules/db/db');
const { sequelize } = connect();

/**
 * @typedef {Object} UserAttributes
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/** @type {import('sequelize').ModelStatic<import('sequelize').Model<UserAttributes>>} */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = {
  User,
};
