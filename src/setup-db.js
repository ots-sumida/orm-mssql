import { connect } from './modules/db/index.js';

const db = connect();

try {
  await db.createDatabaseIfNotExists();
} catch (error) {
  console.error('データベース作成に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
