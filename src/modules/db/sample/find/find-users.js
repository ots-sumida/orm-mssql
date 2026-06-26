import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // User.findAll() - 蜈ｨ莉ｶ蜿門ｾ・
    const users = await User.findAll({
      order: [['id', 'ASC']],
    });

    console.log(`findAll (${users.length}莉ｶ):`);
    for (const user of users) {
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
