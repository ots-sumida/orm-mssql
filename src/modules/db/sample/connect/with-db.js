import { withDb } from '../../db.js';
import { User } from '../../../../models/tables/user.js';

/**
 * 自動接続パターンのサンプル。
 *
 * - withDb: ワンショットスクリプト向け（接続確認 → 処理 → 切断）
 * - registerGracefulShutdown: 長時間稼働アプリ向け（SIGINT/SIGTERM で切断）
 *
 * このファイルは withDb を使う例。手動で testConnection / close する例は
 * connect/test-connection.js を参照。
 */

try {
  await withDb(async () => {
    console.log('接続成功（ensureConnected 済み）\n');

    await User.sync();

    const user = await User.findOne({
      where: { email: 'taro@example.com' },
    });

    if (!user) {
      console.log('taro@example.com のレコードが見つかりません。先に create/create-user を実行してください。');
      return;
    }

    console.log(`取得: id=${user.id}, name=${user.name}, email=${user.email}`);
  });
} catch (error) {
  console.error('処理に失敗しました。');
  console.error(error.message);
  process.exitCode = 1;
}

// 長時間稼働アプリでは connect() 後に1回だけ呼ぶ:
// registerGracefulShutdown(connect());
