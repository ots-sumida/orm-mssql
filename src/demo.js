import { db } from './db.js';
import { User } from './models/user.js';
import { runUserDemo } from './models/user-model.js';

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功');

    await User.sync();
    await runUserDemo();
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
