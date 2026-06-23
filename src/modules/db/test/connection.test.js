import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { createConnectionManager, createSequelize } from '../connection.js';
import { loadDbConfigFromEnv } from '../config/env-config-provider.js';

dotenv.config();

function hasDbEnv() {
  return Boolean(
    process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD,
  );
}

describe('接続統合テスト', { skip: !hasDbEnv() && 'DB 環境変数が未設定のためスキップ' }, () => {
  /** @type {ReturnType<typeof createConnectionManager>} */
  let db;

  before(() => {
    const dbConfig = loadDbConfigFromEnv();
    db = createConnectionManager(dbConfig);
  });

  after(async () => {
    if (db) {
      await db.close();
    }
  });

  it('Sequelize インスタンスにプール設定が反映されている', () => {
    const { pool } = db.sequelize.options;
    assert.equal(pool.max, db.dbConfig.poolMax);
    assert.equal(pool.min, db.dbConfig.poolMin);
    assert.equal(pool.acquire, db.dbConfig.poolAcquire);
    assert.equal(pool.idle, db.dbConfig.poolIdle);
  });

  it('Sequelize インスタンスにタイムアウト設定が反映されている', () => {
    const { options } = db.sequelize.options.dialectOptions;
    assert.equal(options.connectTimeout, db.dbConfig.connectTimeout);
    assert.equal(options.requestTimeout, db.dbConfig.requestTimeout);
  });

  it('Sequelize インスタンスのリトライは無効', () => {
    assert.equal(db.sequelize.options.retry.max, 0);
  });

  it('testConnection で接続できる', async () => {
    await db.testConnection();
  });

  it('プール経由で並列クエリが実行できる', async () => {
    const results = await Promise.all([
      db.sequelize.query('SELECT 1 AS value'),
      db.sequelize.query('SELECT 2 AS value'),
      db.sequelize.query('SELECT 3 AS value'),
    ]);

    assert.equal(results.length, 3);
    assert.equal(results[0][0][0].value, 1);
    assert.equal(results[2][0][0].value, 3);
  });
});

describe('requestTimeout 統合テスト', { skip: !hasDbEnv() && 'DB 環境変数が未設定のためスキップ' }, () => {
  it('requestTimeout 超過のクエリは失敗する', async () => {
    const dbConfig = {
      ...loadDbConfigFromEnv(),
      requestTimeout: 1000,
    };
    const db = createConnectionManager(dbConfig);

    try {
      await db.testConnection();

      await assert.rejects(
        () => db.sequelize.query("WAITFOR DELAY '00:00:03'"),
        (error) => {
          const message = String(error.message ?? error);
          return /timeout|Timeout|ETIMEOUT|cancel/i.test(message);
        },
      );
    } finally {
      await db.close();
    }
  });
});

describe('createSequelize カスタム設定', () => {
  it('.env 未使用の DbConfig でもオプションが反映される', () => {
    const dbConfig = {
      host: 'localhost',
      port: 1433,
      database: 'test',
      user: 'u',
      password: 'p',
      encrypt: true,
      trustServerCertificate: false,
      poolMax: 3,
      poolMin: 1,
      poolAcquire: 11111,
      poolIdle: 22222,
      connectTimeout: 33333,
      requestTimeout: 44444,
    };

    const sequelize = createSequelize(dbConfig);

    try {
      assert.equal(sequelize.options.pool.max, 3);
      assert.equal(sequelize.options.dialectOptions.options.connectTimeout, 33333);
      assert.equal(sequelize.options.dialectOptions.options.requestTimeout, 44444);
      assert.equal(sequelize.options.retry.max, 0);
    } finally {
      return sequelize.close();
    }
  });
});
