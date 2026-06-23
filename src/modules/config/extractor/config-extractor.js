import { loadDbConfigFromEnv } from '../providers/env-config-provider.js';

/**
 * 環境変数から DB 接続設定を取得する（同期）。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {import('../client/sqlsv-client-config.js').DbConfig}
 */
export function extractDbConfigFromEnv(env = process.env) {
  return loadDbConfigFromEnv(env);
}

/**
 * Key Vault など非同期ソースから DB 接続設定を取得する（将来実装）。
 *
 * @param {unknown} _options
 * @returns {Promise<import('../client/sqlsv-client-config.js').DbConfig>}
 */
export async function extractDbConfigFromKeyVault(_options) {
  throw new Error('Key Vault からの設定取得は未実装です。providers/keyvault-config-provider.js を追加してください。');
}
