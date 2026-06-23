import { connect } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功\n');

    // User.sync() - テーブルを定義どおりに作成（存在しなければ作る）
    await User.sync();
    console.log('User.sync() を実行しました。');
    console.log(`テーブル名: ${User.tableName}`);
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
