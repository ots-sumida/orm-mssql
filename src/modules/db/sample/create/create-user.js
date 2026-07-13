'use strict';

const { withDb } = require('../../db');
const { User } = require('../../../../models/tables/user');

(async () => {
  try {  
    await withDb(async (db) => {  
      console.log('接続成功\n');  
    
      await User.sync();  
    
      // User.create() - 1件 INSERT  
      const existing = await User.findOne({ where: { email: 'taro@example.com' } });  
      if (existing) {  
        console.log(`スキップ（既存）: id=${existing.id}, name=${existing.name}, email=${existing.email}`);  
        return;  
      }  
    
      const user = await User.create({  
        name: '山田太郎',  
        email: 'taro@example.com',  
      });  
    
      console.log(`作成: id=${user.id}, name=${user.name}, email=${user.email}`);  
    });  
  } catch (error) {  
    console.error('処理に失敗しました。');  
    console.error(error.message);  
    process.exitCode = 1;  
  }
})();
