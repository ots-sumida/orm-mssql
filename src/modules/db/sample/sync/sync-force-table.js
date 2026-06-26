import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    const beforeCount = await User.count();
    console.log(`force sync 蜑・ ${beforeCount}莉ｶ`);

    // User.sync({ force: true }) - DROP 蠕後↓蜀堺ｽ懈・・医ョ繝ｼ繧ｿ豸亥､ｱ縺ｫ豕ｨ諢擾ｼ・
    await User.sync({ force: true });

    const afterCount = await User.count();
    console.log(`force sync 蠕・ ${afterCount}莉ｶ・医ユ繝ｼ繝悶Ν蜀堺ｽ懈・貂医∩・荏);
    console.log('窶ｻ 髢狗匱迺ｰ蠅・・縺ｿ縺ｧ菴ｿ逕ｨ縺励※縺上□縺輔＞縲・);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
