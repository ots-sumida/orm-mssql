'use strict';

const { withDb } = require('../../db');
const { User } = require('../../../../models/tables/user');

(async () => {
  try {  
    await withDb(async (db) => {  
      console.log('接続成功\n');  
    
      await User.sync();  
    
      // User.findOrCreate() - なければ作成、あれば取得  
      const [user, created] = await User.findOrCreate({  
        where: { email: 'findorcreate@example.com' },  
        defaults: { name: 'FindOrCreate 太郎' },  
      });  
    
      console.log(created ? '新規作成:' : '既存取得:');  
      console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);  
    });  
  } catch (error) {  
    console.error('処理に失敗しました。');  
    console.error(error.message);  
    process.exitCode = 1;  
  }
})();
