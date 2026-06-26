import { withDb } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    // User.findAll() - 全件取得
    const users = await User.findAll({
      order: [['id', 'ASC']],
    });

    console.log(`findAll (${users.length}件):`);
    for (const user of users) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
