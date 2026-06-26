import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    const existing = await User.findOne({ where: { email: 'taro@example.com' } });

    // User.upsert() - 存在すれば更新、なければ作成（MSSQL は id が必要）
    const [user] = await User.upsert({
      id: existing?.id,
      name: existing ? 'Upsert 更新済み' : 'Upsert 新規',
      email: existing ? 'taro@example.com' : 'upsert-new@example.com',
    });

    console.log('upsert 結果:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
