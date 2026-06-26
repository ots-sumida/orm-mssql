import { withDb } from '../../db.js';

try {
  await withDb(async (db) => {
    await db.createDatabaseIfNotExists();
  });
} catch (error) {
  console.error('繝・・繧ｿ繝吶・繧ｹ菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・);
  console.error(error.message);
  process.exitCode = 1;
}
