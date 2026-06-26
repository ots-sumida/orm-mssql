import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // User.max() / min() / sum() - 髮・ｨ・
    const maxId = await User.max('id');
    const minId = await User.min('id');
    const sumId = await User.sum('id');

    console.log(`max(id): ${maxId}`);
    console.log(`min(id): ${minId}`);
    console.log(`sum(id): ${sumId}`);
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
