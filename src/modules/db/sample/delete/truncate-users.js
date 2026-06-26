import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    const beforeCount = await User.count();
    console.log(`truncate 前: ${beforeCount}件`);

    // User.truncate() - テーブル全削除（開発環境のみで使用）
    await User.truncate();

    const afterCount = await User.count();
    console.log(`truncate 後: ${afterCount}件`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
