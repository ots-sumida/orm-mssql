import { withDb } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    const beforeCount = await User.count();

    // sequelize.transaction() + rollback
    const t = await db.sequelize.transaction();

    try {
      await User.create(
        { name: 'Tx Rollback', email: 'tx-rollback@example.com' },
        { transaction: t },
      );

      // 同じ email で重複 INSERT → エラー → rollback
      await User.create(
        { name: 'Tx Rollback Duplicate', email: 'tx-rollback@example.com' },
        { transaction: t },
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.log('rollback しました:', error.message);
    }

    const afterCount = await User.count();
    console.log(`件数: ${beforeCount} → ${afterCount}（rollback 後は増えない）`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
