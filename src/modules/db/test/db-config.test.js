import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSequelizeOptions,
  defaultDbOptions,
  parseBoolean,
  parseInteger,
} from '../config/db-config.js';
import { loadDbConfigFromEnv } from '../config/env-config-provider.js';

const baseConfig = {
  host: 'localhost',
  port: 1433,
  database: 'sampledb',
  user: 'sa',
  password: 'secret',
  encrypt: false,
  trustServerCertificate: true,
  ...defaultDbOptions,
};

describe('parseBoolean', () => {
  it('空文字のときデフォルト値を返す', () => {
    assert.equal(parseBoolean('', true), true);
    assert.equal(parseBoolean(undefined, false), false);
  });

  it('true/false を解釈する', () => {
    assert.equal(parseBoolean('true', false), true);
    assert.equal(parseBoolean('FALSE', true), false);
  });
});

describe('parseInteger', () => {
  it('空文字のときデフォルト値を返す', () => {
    assert.equal(parseInteger('', 10), 10);
  });

  it('数値文字列を解釈する', () => {
    assert.equal(parseInteger('5000', 0), 5000);
  });

  it('不正な値はエラー', () => {
    assert.throws(() => parseInteger('abc', 0), /数値として解釈できません/);
  });
});

describe('buildSequelizeOptions', () => {
  it('プール設定を反映する', () => {
    const options = buildSequelizeOptions({
      ...baseConfig,
      poolMax: 5,
      poolMin: 1,
      poolAcquire: 20000,
      poolIdle: 5000,
    });

    assert.deepEqual(options.pool, {
      max: 5,
      min: 1,
      acquire: 20000,
      idle: 5000,
    });
  });

  it('タイムアウト設定を反映する', () => {
    const options = buildSequelizeOptions({
      ...baseConfig,
      connectTimeout: 10000,
      requestTimeout: 45000,
    });

    assert.equal(options.dialectOptions.options.connectTimeout, 10000);
    assert.equal(options.dialectOptions.options.requestTimeout, 45000);
  });

  it('リトライは無効（max: 0）', () => {
    const options = buildSequelizeOptions(baseConfig);
    assert.deepEqual(options.retry, { max: 0 });
  });
});

describe('loadDbConfigFromEnv', () => {
  it('環境変数からプール・タイムアウトを読み込む', () => {
    const config = loadDbConfigFromEnv({
      DB_HOST: 'db-host',
      DB_PORT: '1433',
      DB_NAME: 'mydb',
      DB_USER: 'user',
      DB_PASSWORD: 'pass',
      DB_POOL_MAX: '7',
      DB_CONNECT_TIMEOUT: '12000',
      DB_REQUEST_TIMEOUT: '90000',
    });

    assert.equal(config.poolMax, 7);
    assert.equal(config.connectTimeout, 12000);
    assert.equal(config.requestTimeout, 90000);
    assert.equal(config.poolMin, defaultDbOptions.poolMin);
  });

  it('必須項目が欠けているとエラー', () => {
    assert.throws(
      () => loadDbConfigFromEnv({ DB_HOST: 'localhost' }),
      /DB 接続に必要な環境変数が未設定です/,
    );
  });
});
