import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    await User.sync();

    // User.findOne() - 条件に合う1件取得
    const user = await User.findOne({
      where: { email: 'taro@example.com' },
    });

    if (!user) {
      console.log('taro@example.com のレコードが見つかりません。先に create/create-user を実行してください。');
      return;
    }

    console.log('findOne:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);

    // User.findByPk() - 主キーで1件取得
    const userByPk = await User.findByPk(user.id);
    console.log('\nfindByPk:');
    console.log(`  id=${userByPk.id}, name=${userByPk.name}, email=${userByPk.email}`);
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
