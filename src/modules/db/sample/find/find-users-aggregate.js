'use strict';

const { withDb } = require('../../db');
const { User } = require('../../../../models/tables/user');

(async () => {
  try {  
    await withDb(async (db) => {  
      console.log('接続成功\n');  
    
      await User.sync();  
    
      // User.max() / min() / sum() - 集計  
      const maxId = await User.max('id');  
      const minId = await User.min('id');  
      const sumId = await User.sum('id');  
    
      console.log(`max(id): ${maxId}`);  
      console.log(`min(id): ${minId}`);  
      console.log(`sum(id): ${sumId}`);  
    });  
  } catch (error) {  
    console.error('処理に失敗しました。');  
    console.error(error.message);  
    process.exitCode = 1;  
  }
})();
