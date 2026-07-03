import dotenv from 'dotenv';

/**
 * サンプルスクリプト用プリロード。
 * .env で DB_LOGGING が未設定のときのみ true にする。
 *
 * npm scripts から --import で読み込む:
 *   node --import ./src/modules/db/sample/enable-sql-logging.js ...
 */
dotenv.config();

if (process.env.DB_LOGGING === undefined) {
  process.env.DB_LOGGING = 'true';
}
