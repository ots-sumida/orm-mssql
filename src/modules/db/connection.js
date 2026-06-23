import { Sequelize } from 'sequelize';
import { buildSequelizeOptions } from './config/db-config.js';
import { loadDbConfigFromEnv } from './config/env-config-provider.js';

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

/**
 * .env から設定を読み込んで接続を生成する。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {ReturnType<typeof createConnectionManager>}
 */
export function createConnectionFromEnv(env = process.env) {
  return createConnectionManager(loadDbConfigFromEnv(env));
}

let sharedConnection = null;

/**
 * アプリ全体で共有する DB 接続を返す（初回のみ生成）。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {ReturnType<typeof createConnectionManager>}
 */
export function connect(env = process.env) {
  if (!sharedConnection) {
    sharedConnection = createConnectionFromEnv(env);
  }
  return sharedConnection;
}
