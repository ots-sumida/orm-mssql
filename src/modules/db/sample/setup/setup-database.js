'use strict';

const { withDb } = require('../../db');

(async () => {
  try {  
    await withDb(async (db) => {  
      await db.createDatabaseIfNotExists();  
    });  
  } catch (error) {  
    console.error('データベース作成に失敗しました。');  
    console.error(error.message);  
    process.exitCode = 1;  
  }
})();
