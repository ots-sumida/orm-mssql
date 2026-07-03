import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSequelizeOptions,
  defaultDbOptions,
  parseBoolean,
  parseInteger,
  resolveSequelizeLogging,
} from '../../config/client/sqlsv-client-config.js';
import { loadDbConfigFromEnv } from '../../config/providers/env-config-provider.js';

const baseConfig = {
  host: 'localhost',
  port: 1433,
  database: 'sampledb',
  user: 'sa',
  password: 'secret',
  encrypt: false,
  trustServerCertificate: true,
  logging: false,
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

  it('logging=false のとき Sequelize logging は無効', () => {
    const options = buildSequelizeOptions({ ...baseConfig, logging: false });
    assert.equal(options.logging, false);
  });

  it('logging=true のとき Sequelize logging は関数', () => {
    const options = buildSequelizeOptions({ ...baseConfig, logging: true });
    assert.equal(typeof options.logging, 'function');
  });
});

describe('resolveSequelizeLogging', () => {
  it('無効時は false を返す', () => {
    assert.equal(resolveSequelizeLogging(false), false);
  });

  it('有効時は SQL を [SQL] プレフィックス付きで出力する', () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    try {
      const logger = resolveSequelizeLogging(true);
      logger('SELECT 1', 12);
      assert.equal(logs.length, 1);
      assert.match(logs[0], /^\[SQL\] \(12ms\) SELECT 1$/);

      logger('SELECT 2', { plain: true });
      assert.equal(logs.length, 2);
      assert.match(logs[1], /^\[SQL\] SELECT 2$/);
    } finally {
      console.log = originalLog;
    }
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

  it('DB_LOGGING を読み込む', () => {
    const enabled = loadDbConfigFromEnv({
      DB_HOST: 'db-host',
      DB_PORT: '1433',
      DB_NAME: 'mydb',
      DB_USER: 'user',
      DB_PASSWORD: 'pass',
      DB_LOGGING: 'true',
    });
    assert.equal(enabled.logging, true);

    const disabled = loadDbConfigFromEnv({
      DB_HOST: 'db-host',
      DB_PORT: '1433',
      DB_NAME: 'mydb',
      DB_USER: 'user',
      DB_PASSWORD: 'pass',
    });
    assert.equal(disabled.logging, false);
  });

  it('必須項目が欠けているとエラー', () => {
    assert.throws(
      () => loadDbConfigFromEnv({ DB_HOST: 'localhost' }),
      /DB 接続に必要な環境変数が未設定です/,
    );
  });
});
