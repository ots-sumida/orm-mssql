import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    const user = await User.findOne({ where: { email: 'hanako@example.com' } });

    if (!user) {
      console.log('hanako@example.com のレコードが見つかりません。先に create/create-users を実行してください。');
      return;
    }

    console.log('削除対象:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);

    // instance.destroy() - 取得済みレコードを削除
    await user.destroy();
    console.log('\ninstance.destroy 完了');

    // User.destroy() - 条件指定で DELETE
    const deletedCount = await User.destroy({
      where: { email: 'ichiro@example.com' },
    });

    console.log(`User.destroy 件数: ${deletedCount}`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
