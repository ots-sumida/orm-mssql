import { connect } from './modules/db/index.js';
import { User } from './models/tables/user.js';
import { createSampleUsers } from './models/user-model.js';

const db = connect();

async function main() {
  try {
    await db.testConnection();
    console.log('接続成功');

    await User.sync();
    await createSampleUsers();
  } catch (error) {
    console.error('処理に失敗しました。');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

main();
