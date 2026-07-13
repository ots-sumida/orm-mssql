'use strict';

const { withDb } = require('../../db');
const { User } = require('../../../../models/tables/user');

(async () => {
  try {  
    await withDb(async (db) => {  
      console.log('接続成功\n');  
    
      await User.sync();  
    
      // User.findAll() - id=1 で絞り込み  
      const targetId = 1;  
      const users = await User.findAll({  
        where: { id: targetId },  
        order: [['id', 'ASC']],  
      });  
    
      console.log(`findAll (id=${targetId}, ${users.length}件):`);  
      for (const user of users) {  
        console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);  
      }  
    });  
  } catch (error) {  
    console.error('処理に失敗しました。');  
    console.error(error.message);  
    if (error.sql) {  
      console.error('[SQL]', error.sql);  
    }  
    process.exitCode = 1;  
  }
})();
