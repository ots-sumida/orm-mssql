import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    await User.sync();

    // User.build() + save() - インスタンス生成後に保存
    const user = User.build({
      name: 'BuildSave 花子',
      email: 'buildsave@example.com',
    });

    await user.save();

    console.log(`保存: id=${user.id}, name=${user.name}, email=${user.email}`);
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
