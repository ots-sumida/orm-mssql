'use strict';

const { Sequelize } = require('sequelize');
const { buildSequelizeOptions, attachSqlDebugLogging } = require('../../config/client/sqlsv-client-config');
const { extractDbConfigFromEnv } = require('../../config/extractor/config-extractor');
const { assertSqlParamsMatch } = require('../../validation/sql/param-checker');
/**
 * @param {import('../../config/client/sqlsv-client-config.js').DbConfig} dbConfig
 * @param {string} [database]
 * @returns {Sequelize}
 */
function createSequelize(dbConfig, database = dbConfig.database) {
  const sequelize = new Sequelize(
    database,
    dbConfig.user,
    dbConfig.password,
    buildSequelizeOptions(dbConfig),
  );

  if (dbConfig.logging) {
    attachSqlDebugLogging(sequelize);
  }

  return sequelize;
}

/**
 * @param {import('../../config/client/sqlsv-client-config.js').DbConfig} dbConfig
 */
function createConnectionManager(dbConfig) {
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

        const findDbSql = 'SELECT name FROM sys.databases WHERE name = :dbName';
        const findDbReplacements = { dbName: dbConfig.database };
        assertSqlParamsMatch(findDbSql, findDbReplacements);

        const [results] = await adminSequelize.query(findDbSql, {
          replacements: findDbReplacements,
        });

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
function createConnectionFromEnv(env = process.env) {
  return createConnectionManager(extractDbConfigFromEnv(env));
}

let sharedConnection = null;

/**
 * アプリ全体で共有する DB 接続を返す（初回のみ生成）。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {ReturnType<typeof createConnectionManager>}
 */
function connect(env = process.env) {
  if (!sharedConnection) {
    sharedConnection = createConnectionFromEnv(env);
  }
  return sharedConnection;
}

/**
 * 共有接続を閉じてシングルトンをリセットする。
 */
async function disconnect() {
  if (!sharedConnection) {
    return;
  }

  const db = sharedConnection;
  sharedConnection = null;
  await db.close();
}

module.exports = {
  createSequelize,
  createConnectionManager,
  createConnectionFromEnv,
  connect,
  disconnect,
};
