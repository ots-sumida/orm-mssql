import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    await User.sync();

    // sequelize.transaction() + commit
    const t = await db.sequelize.transaction();

    try {
      const userA = await User.create(
        { name: 'Tx Commit A', email: 'tx-commit-a@example.com' },
        { transaction: t },
      );
      const userB = await User.create(
        { name: 'Tx Commit B', email: 'tx-commit-b@example.com' },
        { transaction: t },
      );

      await t.commit();

      console.log('commit 成功:');
      console.log(`  id=${userA.id}, email=${userA.email}`);
      console.log(`  id=${userB.id}, email=${userB.email}`);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
