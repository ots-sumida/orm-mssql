import { User } from './tables/user.js';
import { formatRowAsCsv, formatRowsAsCsv } from '../modules/db/format/csv-format.js';

const USER_CSV_COLUMNS = ['id', 'name', 'email'];

/**
 * トランザクション内で処理を実行し、成功時 commit・失敗時 rollback する。
 *
 * @template T
 * @param {(transaction: import('sequelize').Transaction) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function withTransaction(fn) {
  const transaction = await User.sequelize.transaction();

  try {
    const result = await fn(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * @param {{ name: string, email: string }} params
 * @param {{ transaction?: import('sequelize').Transaction }} [options]
 */
export async function createUser({ name, email }, { transaction } = {}) {
  const queryOptions = transaction ? { transaction } : {};

  const existing = await User.findOne({
    where: { email },
    ...queryOptions,
  });

  if (existing) {
    console.log(`スキップ（既存）: id=${existing.id}, name=${existing.name}, email=${existing.email}`);
    return existing;
  }

  const user = await User.create({ name, email }, queryOptions);
  console.log(`作成: id=${user.id}, name=${user.name}, email=${user.email}`);
  return user;
}

export async function createSampleUsers() {
  await withTransaction(async (transaction) => {
    await createUser({ name: '山田太郎', email: 'taro@example.com' }, { transaction });
    await createUser({ name: '佐藤花子', email: 'hanako@example.com' }, { transaction });
  });

  console.log('createSampleUsers: トランザクション commit 完了');
}

export async function runUserDemo() {
  await withTransaction(async (transaction) => {
    const user = await User.findOne({
      where: { email: 'taro@example.com' },
      transaction,
    });

    if (!user) {
      throw new Error('taro@example.com のレコードが見つかりません');
    }

    console.log(`取得: id=${user.id}, name=${user.name}, email=${user.email}`);

    await user.update({ name: '山田太郎（更新済み）' }, { transaction });
    console.log(`更新後: id=${user.id}, name=${user.name}`);
  });

  const allUsers = await User.findAll({ order: [['id', 'ASC']] });
  console.log(`\n全件取得 (${allUsers.length}件):`);
  for (const u of allUsers) {
    console.log(`  id=${u.id}, name=${u.name}, email=${u.email}`);
  }
}

export { withTransaction };

/**
 * 複数 ID をプール経由で並列取得する。
 *
 * @param {number[]} ids
 */
export async function findUsersByIdsParallel(ids) {
  const results = await Promise.all(
    ids.map((id) => User.findByPk(id)),
  );
  return results.filter(Boolean);
}

/**
 * 全ユーザーをコンマ区切り文字列で返す。
 *
 * @param {{ header?: boolean }} [options]
 * @returns {Promise<string>}
 */
export async function listAllUsersAsCsv({ header = true } = {}) {
  const users = await User.findAll({
    order: [['id', 'ASC']],
    raw: true,
  });
  return formatRowsAsCsv(users, USER_CSV_COLUMNS, { header });
}

/**
 * 1ユーザーをコンマ区切り文字列で返す。
 *
 * @param {string} email
 * @returns {Promise<string | null>}
 */
export async function findUserAsCsv(email) {
  const user = await User.findOne({
    where: { email },
    raw: true,
  });

  if (!user) {
    return null;
  }

  return formatRowAsCsv(user, USER_CSV_COLUMNS);
}
