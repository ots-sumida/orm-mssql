import { withDb } from '../../db.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    // sequelize.query() - 生 SQL（SELECT）
    const [rows] = await db.sequelize.query(
      'SELECT id, name, email FROM users WHERE email = :email',
      { replacements: { email: 'taro@example.com' } },
    );

    console.log('query SELECT 結果:');
    for (const row of rows) {
      console.log(`  id=${row.id}, name=${row.name}, email=${row.email}`);
    }

    if (rows.length === 0) {
      console.log('（0件）先に create/create-user を実行してください。');
    }
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
