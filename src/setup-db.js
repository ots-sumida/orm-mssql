import { db } from './db.js';

try {
  await db.createDatabaseIfNotExists();
} catch (error) {
  console.error('データベース作成に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
