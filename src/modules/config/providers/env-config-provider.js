'use strict';

const dotenv = require('dotenv');
const { assertValid, parseBoolean, parseInteger, requireAllNonEmpty } = require('../../validation/common/well-used-validation');
const { defaultDbOptions } = require('../client/sqlsv-client-config');
/**
 * .env / process.env から DB 接続設定を取得する。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {import('../client/sqlsv-client-config.js').DbConfig}
 */
function loadDbConfigFromEnv(env = process.env) {
  dotenv.config();

  const {
    DB_HOST,
    DB_PORT = '1433',
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_ENCRYPT = 'false',
    DB_TRUST_SERVER_CERTIFICATE = 'true',
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_POOL_ACQUIRE,
    DB_POOL_IDLE,
    DB_CONNECT_TIMEOUT,
    DB_REQUEST_TIMEOUT,
    DB_LOGGING = 'false',
  } = env;

  assertValid(requireAllNonEmpty(
    { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD },
    ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'],
    { prefix: 'DB 接続に必要な環境変数が未設定です' },
  ));

  return {
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    encrypt: parseBoolean(DB_ENCRYPT, false),
    trustServerCertificate: parseBoolean(DB_TRUST_SERVER_CERTIFICATE, true),
    poolMax: parseInteger(DB_POOL_MAX, defaultDbOptions.poolMax),
    poolMin: parseInteger(DB_POOL_MIN, defaultDbOptions.poolMin),
    poolAcquire: parseInteger(DB_POOL_ACQUIRE, defaultDbOptions.poolAcquire),
    poolIdle: parseInteger(DB_POOL_IDLE, defaultDbOptions.poolIdle),
    connectTimeout: parseInteger(DB_CONNECT_TIMEOUT, defaultDbOptions.connectTimeout),
    requestTimeout: parseInteger(DB_REQUEST_TIMEOUT, defaultDbOptions.requestTimeout),
    logging: parseBoolean(DB_LOGGING, false),
  };
}

module.exports = {
  loadDbConfigFromEnv,
};
