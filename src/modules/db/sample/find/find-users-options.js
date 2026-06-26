import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('謗･邯壽・蜉歃n');

    await User.sync();

    // attributes - 蜿門ｾ励☆繧句・繧呈欠螳・
    const partial = await User.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']],
      limit: 3,
      offset: 0,
      raw: true,
    });

    console.log('attributes + limit + offset + raw:');
    console.log(partial);

    // order - 荳ｦ縺ｳ譖ｿ縺・
    const ordered = await User.findAll({
      attributes: ['id', 'email'],
      order: [['email', 'DESC']],
      limit: 3,
    });

    console.log('\norder by email DESC:');
    for (const user of ordered) {
      console.log(`  id=${user.id}, email=${user.email}`);
    }
  });
} catch (error) {
  console.error('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
