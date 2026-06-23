import { withDb } from '../../index.js';
import { formatRowAsCsv, formatRowsAsCsv } from '../../format/csv-format.js';
import { User } from '../../../../models/tables/user.js';

const COLUMNS = ['id', 'name', 'email'];

try {
  await withDb(async () => {
    console.log('接続成功\n');

    await User.sync();

    const users = await User.findAll({
      order: [['id', 'ASC']],
      raw: true,
    });

    // formatRowAsCsv - 1行
    if (users.length > 0) {
      console.log('formatRowAsCsv（1行）:');
      console.log(formatRowAsCsv(users[0], COLUMNS));
    }

    // formatRowsAsCsv - 複数行（ヘッダー付き）
    console.log('\nformatRowsAsCsv（ヘッダー付き）:');
    console.log(formatRowsAsCsv(users, COLUMNS, { header: true }));
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
