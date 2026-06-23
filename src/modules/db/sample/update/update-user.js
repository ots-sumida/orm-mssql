import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    await User.sync();

    const user = await User.findOne({ where: { email: 'taro@example.com' } });

    if (!user) {
      console.log('taro@example.com のレコードが見つかりません。先に create/create-user を実行してください。');
      return;
    }

    console.log('更新前:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);

    // instance.update() - 取得済みレコードを更新
    await user.update({ name: '山田太郎（更新済み）' });

    console.log('\ninstance.update 後:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);

    // User.update() - 条件指定で一括 UPDATE
    const [updatedCount] = await User.update(
      { name: '山田太郎' },
      { where: { email: 'taro@example.com' } },
    );

    console.log(`\nUser.update 件数: ${updatedCount}`);
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
