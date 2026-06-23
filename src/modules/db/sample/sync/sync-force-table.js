import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    const beforeCount = await User.count();
    console.log(`force sync 前: ${beforeCount}件`);

    // User.sync({ force: true }) - DROP 後に再作成（データ消失に注意）
    await User.sync({ force: true });

    const afterCount = await User.count();
    console.log(`force sync 後: ${afterCount}件（テーブル再作成済み）`);
    console.log('※ 開発環境のみで使用してください。');
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
