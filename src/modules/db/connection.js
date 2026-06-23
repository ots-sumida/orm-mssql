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
  /** @type {Promise<void> | null} */
  let ensureConnectedPromise = null;

  return {
    sequelize,
    dbConfig,

    /**
     * 接続を確立する（初回のみ authenticate、以降は同じ Promise を再利用）。
     */
    async ensureConnected() {
      if (!ensureConnectedPromise) {
        ensureConnectedPromise = sequelize.authenticate().catch((error) => {
          ensureConnectedPromise = null;
          throw error;
        });
      }
      await ensureConnectedPromise;
    },

    async testConnection() {
      await this.ensureConnected();
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
      ensureConnectedPromise = null;
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

/**
 * 共有接続を閉じてシングルトンをリセットする。
 */
export async function disconnect() {
  if (!sharedConnection) {
    return;
  }

  const db = sharedConnection;
  sharedConnection = null;
  await db.close();
}
