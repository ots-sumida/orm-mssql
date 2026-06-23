import dotenv from 'dotenv';
import { parseBoolean } from './db-config.js';

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
  };
}
