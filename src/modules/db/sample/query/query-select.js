import { withDb } from '../../db.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    // sequelize.query() - 逕・SQL・・ELECT・・
    const [rows] = await db.sequelize.query(
      'SELECT id, name, email FROM users WHERE email = :email',
      { replacements: { email: 'taro@example.com' } },
    );

    console.log('query SELECT 邨先棡:');
    for (const row of rows) {
      console.log(`  id=${row.id}, name=${row.name}, email=${row.email}`);
    }

    if (rows.length === 0) {
      console.log('・・莉ｶ・牙・縺ｫ create/create-user 繧貞ｮ溯｡後＠縺ｦ縺上□縺輔＞縲・);
    }
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
