import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続�E功\n');

    await User.sync();

    // User.count() - 件数のみ
    const total = await User.count();
    const yamadaCount = await User.count({
      where: { name: '山田太郁E },
    });

    console.log(`count 全件: ${total}`);
    console.log(`count name='山田太郁E: ${yamadaCount}`);

    // User.findAndCountAll() - 取征E+ 件数
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
  console.error('処琁E��失敗しました、E);
  console.error(error.message);
  process.exitCode = 1;
}
