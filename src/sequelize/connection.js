import { Sequelize } from 'sequelize';
import { buildSequelizeOptions } from './config/db-config.js';

/**
 * @param {import('./config/db-config.js').DbConfig} dbConfig
 * @param {string} [database]
 * @returns {Sequelize}
 */
export function createSequelize(dbConfig, database = dbConfig.database) {
  return new Sequelize(
    database,
    dbConfig.user,
    dbConfig.password,
    buildSequelizeOptions(dbConfig),
  );
}

/**
 * @param {import('./config/db-config.js').DbConfig} dbConfig
 */
export function createConnectionManager(dbConfig) {
  const sequelize = createSequelize(dbConfig);

  return {
    sequelize,
    dbConfig,

    async testConnection() {
      await sequelize.authenticate();
    },

    async createDatabaseIfNotExists() {
      const adminSequelize = createSequelize(dbConfig, 'master');

      try {
        await adminSequelize.authenticate();

        const [results] = await adminSequelize.query(
          `SELECT name FROM sys.databases WHERE name = :dbName`,
          { replacements: { dbName: dbConfig.database } },
        );

        if (results.length > 0) {
          console.log(`データベース "${dbConfig.database}" は既に存在します。`);
          return;
        }

        const escapedName = dbConfig.database.replace(/]/g, ']]');
        await adminSequelize.query(`CREATE DATABASE [${escapedName}]`);
        console.log(`データベース "${dbConfig.database}" を作成しました。`);
      } finally {
        await adminSequelize.close();
      }
    },

    async close() {
      await sequelize.close();
    },
  };
}
