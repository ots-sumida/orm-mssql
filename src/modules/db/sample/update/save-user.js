import { withDb } from '../../index.js';
import { User } from '../../../../models/tables/user.js';

try {
  await withDb(async (db) => {
    console.log('接続成功\n');

    await User.sync();

    const user = await User.findOne({ where: { email: 'taro@example.com' } });

    if (!user) {
      console.log('taro@example.com のレコードが見つかりません。先に create/create-user を実行してください。');
      return;
    }

    console.log('変更前:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);

    // instance.save() - プロパティを変更して保存
    user.name = 'Save メソッド更新';
    await user.save();

    console.log('\nsave 後:');
    console.log(`  id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}
