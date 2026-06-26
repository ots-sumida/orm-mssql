import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // User.findOrCreate() - 縺ｪ縺代ｌ縺ｰ菴懈・縲√≠繧後・蜿門ｾ・
    const [user, created] = await User.findOrCreate({
      where: { email: 'findorcreate@example.com' },
      defaults: { name: 'FindOrCreate 螟ｪ驛・ },
    });

    console.log(created ? '譁ｰ隕丈ｽ懈・:' : '譌｢蟄伜叙蠕・');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
