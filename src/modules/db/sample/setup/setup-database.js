import { withDb } from '../../index.js';

try {
  await withDb(async (db) => {
    await db.createDatabaseIfNotExists();
  });
} catch (error) {
  console.error('データベース作成に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
