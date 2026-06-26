import { Op } from 'sequelize';
import { withDb } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    // Op.like - 部分一致
    const likeUsers = await User.findAll({
      where: { name: { [Op.like]: '%山田%' } },
      order: [['id', 'ASC']],
    });

    console.log(`Op.like '%山田%' (${likeUsers.length}件):`);
    for (const user of likeUsers) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
    }

    // Op.in - 複数値一致
    const inUsers = await User.findAll({
      where: {
        email: { [Op.in]: ['taro@example.com', 'hanako@example.com'] },
      },
      order: [['id', 'ASC']],
    });

    console.log(`\nOp.in (${inUsers.length}件):`);
    for (const user of inUsers) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
