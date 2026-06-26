import { withDb } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    // User.count() - 件数のみ
    const total = await User.count();
    const yamadaCount = await User.count({
      where: { name: '山田太郎' },
    });

    console.log(`count 全件: ${total}`);
    console.log(`count name='山田太郎': ${yamadaCount}`);

    // User.findAndCountAll() - 取得 + 件数
    const { count, rows } = await User.findAndCountAll({
      limit: 2,
      offset: 0,
      order: [['id', 'ASC']],
    });

    console.log(`\nfindAndCountAll count=${count}, rows=${rows.length}:`);
    for (const user of rows) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
