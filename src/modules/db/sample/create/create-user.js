import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // User.create() - 1莉ｶ INSERT
    const existing = await User.findOne({ where: { email: 'taro@example.com' } });
    if (existing) {
      console.log(`繧ｹ繧ｭ繝・・・域里蟄假ｼ・ id=${existing.id}, name=${existing.name}, email=${existing.email}`);
      return;
    }

    const user = await User.create({
      name: '螻ｱ逕ｰ螟ｪ驛・,
      email: 'taro@example.com',
    });

    console.log(`菴懈・: id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
