import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async () => {
    console.log('接続成功\n');

    await User.sync();

    const ids = [1, 2, 3];

    // Promise.all で並列クエリ（コネクションプール経由）
    const start = Date.now();
    const users = await Promise.all(
      ids.map((id) => User.findByPk(id)),
    );
    const elapsed = Date.now() - start;

    console.log(`Promise.all 並列取得 (${elapsed}ms):`);
    for (const user of users) {
      if (user) {
        console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
      } else {
        console.log('  （該当なし）');
      }
    }

    console.log('\n※ pool.max 以上の同時実行は、空き接続が出るまで acquire で待ちます。');
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
