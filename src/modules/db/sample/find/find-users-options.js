import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    // attributes - 取得する列を指定
    const partial = await User.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']],
      limit: 3,
      offset: 0,
      raw: true,
    });

    console.log('attributes + limit + offset + raw:');
    console.log(partial);

    // order - 並び替え
    const ordered = await User.findAll({
      attributes: ['id', 'email'],
      order: [['email', 'DESC']],
      limit: 3,
    });

    console.log('\norder by email DESC:');
    for (const user of ordered) {
      console.log(`  id=${user.id}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
