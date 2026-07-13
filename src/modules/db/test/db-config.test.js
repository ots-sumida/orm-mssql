'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { attachSqlDebugLogging,
  buildSequelizeOptions,
  defaultDbOptions,
  formatSqlLiteral,
  inlineSqlParameters,
  parseBoolean,
  parseInteger,
  resolveExecutableSql,
  resolveSequelizeLogging,
  shouldSkipSqlLog, } = require('../../config/client/sqlsv-client-config');
const { loadDbConfigFromEnv } = require('../../config/providers/env-config-provider');
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

  it('logging=true のとき afterQuery フックで出力する', () => {
    const options = buildSequelizeOptions({ ...baseConfig, logging: true });
    assert.equal(options.logging, false);
    assert.equal(typeof attachSqlDebugLogging, 'function');
  });
});

describe('formatSqlLiteral', () => {
  it('文字列・数値・NULL を SQL リテラルに変換する', () => {
    assert.equal(formatSqlLiteral('taro@example.com'), "N'taro@example.com'");
    assert.equal(formatSqlLiteral(1), '1');
    assert.equal(formatSqlLiteral(null), 'NULL');
  });
});

describe('inlineSqlParameters', () => {
  it('@name / :name を実際の値に置き換える', () => {
    const sql = 'SELECT * FROM users WHERE email = @email AND id = @id';
    assert.equal(
      inlineSqlParameters(sql, { email: 'taro@example.com', id: 1 }),
      "SELECT * FROM users WHERE email = N'taro@example.com' AND id = 1",
    );
  });
});

describe('resolveExecutableSql', () => {
  it('replacements を SQL に埋め込む', () => {
    assert.equal(
      resolveExecutableSql(
        { replacements: { email: 'taro@example.com' } },
        'SELECT * FROM users WHERE email = @email',
      ),
      "SELECT * FROM users WHERE email = N'taro@example.com'",
    );
  });
});

describe('shouldSkipSqlLog', () => {
  it('接続確認・sync 用 SQL はスキップする', () => {
    assert.equal(shouldSkipSqlLog({ type: 'SELECT' }, 'SELECT 1+1 AS result'), true);
    assert.equal(shouldSkipSqlLog({ type: 'SHOWTABLES' }, "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'users'"), true);
    assert.equal(shouldSkipSqlLog({ type: 'SELECT' }, "SELECT [id] FROM [users] WHERE [email] = N'taro@example.com'"), false);
  });
});

describe('resolveSequelizeLogging', () => {
  it('常に false を返す（出力はフック側）', () => {
    assert.equal(resolveSequelizeLogging(false), false);
    assert.equal(resolveSequelizeLogging(true), false);
  });
});

describe('loadDbConfigFromEnv', () => {
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
  });

  it('必須項目が欠けているとエラー', () => {
    assert.throws(
      () => loadDbConfigFromEnv({ DB_HOST: 'localhost' }),
      /DB 接続に必要な環境変数が未設定です/,
    );
  });
});
