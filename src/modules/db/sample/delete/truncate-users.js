import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    const beforeCount = await User.count();
    console.log(`truncate 蜑・ ${beforeCount}莉ｶ`);

    // User.truncate() - 繝・・繝悶Ν蜈ｨ蜑企勁・磯幕逋ｺ迺ｰ蠅・・縺ｿ縺ｧ菴ｿ逕ｨ・・
    await User.truncate();

    const afterCount = await User.count();
    console.log(`truncate 蠕・ ${afterCount}莉ｶ`);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
