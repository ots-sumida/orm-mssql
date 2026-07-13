'use strict';

const { connect, disconnect } = require('./connection');
let shutdownHooksRegistered = false;

/**
 * 共有 Sequelize インスタンスを返す。
 * 初回クエリ時に Sequelize が接続する。事前確認が必要なら ensureConnected() を呼ぶ。
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {import('sequelize').Sequelize}
 */
function getSequelize(env = process.env) {
  return connect(env).sequelize;
}

/**
 * プロセス終了時に DB 接続を閉じる（SIGINT / SIGTERM）。
 * 長時間稼働するアプリで connect() 後に1回呼ぶ。
 *
 * @param {ReturnType<typeof connect>} [db]
 */
function registerGracefulShutdown(db) {
  if (shutdownHooksRegistered) {
    return;
  }
  shutdownHooksRegistered = true;

  const shutdown = async (exitCode) => {
    try {
      if (db) {
        await db.close();
      }
      await disconnect();
    } catch {
      // 終了処理中のエラーは握りつぶす
    }
    process.exit(exitCode);
  };

  process.once('SIGINT', () => shutdown(130));
  process.once('SIGTERM', () => shutdown(0));
}

/**
 * 接続確認 → 処理 → 切断をまとめて実行する（ワンショットスクリプト向け）。
 *
 * @template T
 * @param {(db: ReturnType<typeof connect>) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function withDb(fn) {
  const db = connect();

  try {
    await db.ensureConnected();
    return await fn(db);
  } finally {
    await disconnect();
  }
}

module.exports = {
  getSequelize,
  registerGracefulShutdown,
  withDb,
};
