import { connect } from '../../db.js';

const db = connect();

try {
  await db.testConnection();
  console.log('接続成功: MSSQL への接続を確認しました。');
  console.log(`接続先: ${db.sequelize.config.host}:${db.sequelize.config.port}/${db.sequelize.config.database}`);
} catch (error) {
  console.error('接続失敗: MSSQL への接続に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await db.close();
}
