'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
const { connect,
  disconnect,
  createConnectionManager,
  withDb,
  getSequelize, } = require('../db');
const { loadDbConfigFromEnv } = require('../../config/providers/env-config-provider');
dotenv.config();

function hasDbEnv() {
  return Boolean(
    process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD,
  );
}

describe('ensureConnected', { skip: !hasDbEnv() && 'DB 環境変数が未設定のためスキップ' }, () => {
  /** @type {ReturnType<typeof createConnectionManager>} */
  let db;

  before(() => {
    db = createConnectionManager(loadDbConfigFromEnv());
  });

  after(async () => {
    if (db) {
      await db.close();
    }
  });

  it('ensureConnected で接続できる', async () => {
    await db.ensureConnected();
  });

  it('ensureConnected は複数回呼んでも問題ない', async () => {
    await Promise.all([
      db.ensureConnected(),
      db.ensureConnected(),
      db.ensureConnected(),
    ]);
    const [rows] = await db.sequelize.query('SELECT 1 AS value');
    assert.equal(rows[0].value, 1);
  });

  it('testConnection は ensureConnected と同等', async () => {
    await db.testConnection();
  });
});

describe('withDb / disconnect', { skip: !hasDbEnv() && 'DB 環境変数が未設定のためスキップ' }, () => {
  after(async () => {
    await disconnect();
  });

  it('withDb は処理後に disconnect する', async () => {
    await withDb(async (db) => {
      const [rows] = await db.sequelize.query('SELECT 1 AS value');
      assert.equal(rows[0].value, 1);
    });

    const db = connect();
    await db.ensureConnected();
    await disconnect();
  });

  it('getSequelize は connect と同じインスタンスを返す', async () => {
    await withDb(async (db) => {
      assert.equal(getSequelize(), db.sequelize);
    });
  });
});

describe('disconnect', () => {
  it('接続がなければ何もしない', async () => {
    await disconnect();
    await disconnect();
  });
});
