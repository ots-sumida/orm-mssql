import { User } from './tables/user.js';

export async function createUser({ name, email }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`スキップ（既存）: id=${existing.id}, name=${existing.name}, email=${existing.email}`);
    return existing;
  }

  const user = await User.create({ name, email });
  console.log(`作成: id=${user.id}, name=${user.name}, email=${user.email}`);
  return user;
}

export async function createSampleUsers() {
  await createUser({ name: '山田太郎', email: 'taro@example.com' });
  await createUser({ name: '佐藤花子', email: 'hanako@example.com' });
}

export async function runUserDemo() {
  const user = await User.findOne({ where: { email: 'taro@example.com' } });
  if (!user) {
    throw new Error('taro@example.com のレコードが見つかりません');
  }
  console.log(`取得: id=${user.id}, name=${user.name}, email=${user.email}`);

  await user.update({ name: '山田太郎（更新済み）' });
  console.log(`更新後: id=${user.id}, name=${user.name}`);

  const allUsers = await User.findAll({ order: [['id', 'ASC']] });
  console.log(`\n全件取得 (${allUsers.length}件):`);
  for (const u of allUsers) {
    console.log(`  id=${u.id}, name=${u.name}, email=${u.email}`);
  }
}
