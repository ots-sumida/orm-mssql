import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    await User.sync();

    // User.bulkCreate() - 複数件 INSERT
    const users = await User.bulkCreate([
      { name: '佐藤花子', email: 'hanako@example.com' },
      { name: '鈴木一郎', email: 'ichiro@example.com' },
    ]);

    console.log(`bulkCreate 完了 (${users.length}件):`);
    for (const user of users) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
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
