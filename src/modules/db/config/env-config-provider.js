import dotenv from 'dotenv';
import { defaultDbOptions, parseBoolean, parseInteger } from './db-config.js';

/**
 * .env / process.env から DB 接続設定を取得する。
 * 将来 Key Vault 用プロバイダを追加する場合も、同じ DbConfig 形式を返す。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {import('./db-config.js').DbConfig}
 */
export function loadDbConfigFromEnv(env = process.env) {
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
  } = env;

  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST');
  if (!DB_NAME) missing.push('DB_NAME');
  if (!DB_USER) missing.push('DB_USER');
  if (!DB_PASSWORD) missing.push('DB_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`DB 接続に必要な環境変数が未設定です: ${missing.join(', ')}`);
  }

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
  };
}
