import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // User.build() + save() - 繧､繝ｳ繧ｹ繧ｿ繝ｳ繧ｹ逕滓・蠕後↓菫晏ｭ・
    const user = User.build({
      name: 'BuildSave 闃ｱ蟄・,
      email: 'buildsave@example.com',
    });

    await user.save();

    console.log(`菫晏ｭ・ id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
