# Sequelize データベース操作リファレンス

このプロジェクト（`User` モデル）を例に、Sequelize でよく使う DB 操作を列挙します。

```javascript
import { User } from '../models/tables/user.js';
import { connect } from '../modules/db/index.js';

const { sequelize } = connect();
```

---

## 作成（Create）

| メソッド | 説明 | 例 |
|----------|------|-----|
| `Model.create()` | 1件 INSERT | `await User.create({ name: '山田', email: 'a@b.com' })` |
| `Model.bulkCreate()` | 複数件 INSERT | `await User.bulkCreate([{ name: 'A' }, { name: 'B' }])` |
| `Model.findOrCreate()` | なければ作成、あれば取得 | `await User.findOrCreate({ where: { email }, defaults: { name } })` |
| `Model.upsert()` | 存在すれば更新、なければ作成 | `await User.upsert({ id: 1, name: '山田' })` |
| `Model.build()` + `save()` | インスタンス生成後に保存 | `const u = User.build({ name: '山田' }); await u.save()` |

---

## 取得（Read）

| メソッド | 説明 | 例 |
|----------|------|-----|
| `Model.findAll()` | 条件に合う全件取得 | `await User.findAll({ where: { name: '山田' } })` |
| `Model.findOne()` | 条件に合う1件取得 | `await User.findOne({ where: { email: 'a@b.com' } })` |
| `Model.findByPk()` | 主キーで1件取得 | `await User.findByPk(1)` |
| `Model.findAndCountAll()` | 全件取得 + 件数 | `await User.findAndCountAll({ limit: 10, offset: 0 })` |
| `Model.count()` | 件数のみ | `await User.count({ where: { name: '山田' } })` |
| `Model.max()` | 最大値 | `await User.max('id')` |
| `Model.min()` | 最小値 | `await User.min('id')` |
| `Model.sum()` | 合計 | `await User.sum('id')` |

### よく使うオプション

```javascript
await User.findAll({
  where: { name: '山田太郎' },           // WHERE
  attributes: ['id', 'name'],           // SELECT する列
  order: [['id', 'ASC']],               // ORDER BY
  limit: 10,                            // LIMIT
  offset: 20,                           // OFFSET
  raw: true,                            // プレーンオブジェクトで返す
});
```

### WHERE 条件の書き方

```javascript
import { Op } from 'sequelize';

await User.findAll({
  where: {
    id: 1,                              // id = 1
    name: { [Op.like]: '%山田%' },       // name LIKE '%山田%'
    email: { [Op.in]: ['a@b.com', 'c@d.com'] },
    createdAt: { [Op.gte]: new Date('2024-01-01') },
  },
});
```

---

## 更新（Update）

| メソッド | 説明 | 例 |
|----------|------|-----|
| `instance.update()` | 取得済みレコードを更新 | `await user.update({ name: '新名前' })` |
| `instance.save()` | 変更を保存 | `user.name = '新名前'; await user.save()` |
| `Model.update()` | 条件指定で一括 UPDATE | `await User.update({ name: 'X' }, { where: { id: 1 } })` |
| `Model.increment()` | 数値を加算 | `await User.increment('loginCount', { where: { id: 1 } })` |
| `Model.decrement()` | 数値を減算 | `await User.decrement('loginCount', { where: { id: 1 } })` |

---

## 削除（Delete）

| メソッド | 説明 | 例 |
|----------|------|-----|
| `instance.destroy()` | 取得済みレコードを削除 | `await user.destroy()` |
| `Model.destroy()` | 条件指定で DELETE | `await User.destroy({ where: { id: 1 } })` |
| `Model.truncate()` | テーブル全削除 | `await User.truncate()` |

---

## 生 SQL

| メソッド | 説明 | 例 |
|----------|------|-----|
| `sequelize.query()` | 任意 SQL 実行 | `await sequelize.query('SELECT * FROM users')` |

```javascript
// プレースホルダ付き
const [results] = await sequelize.query(
  'SELECT * FROM users WHERE email = :email',
  { replacements: { email: 'taro@example.com' } },
);
```

---

## スキーマ・接続

| メソッド | 説明 | 例 |
|----------|------|-----|
| `sequelize.authenticate()` | 接続確認 | `await sequelize.authenticate()` |
| `Model.sync()` | テーブル作成/更新 | `await User.sync()` |
| `Model.sync({ force: true })` | テーブル DROP 後に再作成 | 開発時のみ注意 |
| `Model.sync({ alter: true })` | 定義差分を反映 | 本番では非推奨 |
| `sequelize.close()` | 接続クローズ | `await sequelize.close()` |

---

## トランザクション

```javascript
const t = await sequelize.transaction();
try {
  await User.create({ name: 'A', email: 'a@b.com' }, { transaction: t });
  await User.create({ name: 'B', email: 'c@d.com' }, { transaction: t });
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

| メソッド | 説明 |
|----------|------|
| `sequelize.transaction()` | トランザクション開始 |
| `transaction.commit()` | 確定 |
| `transaction.rollback()` | ロールバック |

---

## リレーション（関連テーブル）

モデル定義時:

```javascript
User.hasMany(Post);
Post.belongsTo(User);
```

取得時（JOIN）:

```javascript
await User.findAll({
  include: [{ model: Post }],
});
```

| 関連定義 | 意味 |
|----------|------|
| `hasOne` | 1対1（親側） |
| `belongsTo` | 1対1（子側） |
| `hasMany` | 1対多 |
| `belongsToMany` | 多対多 |

---

## このプロジェクトでの対応

| ファイル | 使っている操作 |
|----------|----------------|
| `models/user-model.js` → `createUser` | `findOne`, `create` |
| `models/user-model.js` → `runUserDemo` | `findOne`, `update`, `findAll` |
| `modules/db/connection.js` | `authenticate`, `query`, `close` |
| `modules/db/connection.js` → `connect()` | env 取得 → connection 生成 |
| `modules/db/sample/create/create-user.js` | `create` |
| `modules/db/sample/create/create-users.js` | `bulkCreate` |
| `modules/db/sample/find/find-user.js` | `findOne`, `findByPk` |
| `modules/db/sample/find/find-users.js` | `findAll` |
| `modules/db/sample/update/update-user.js` | `update` |
| `modules/db/sample/delete/delete-user.js` | `destroy` |
| `modules/db/sample/sync/sync-table.js` | `sync` |

---

## 参考

- [Sequelize 公式ドキュメント](https://sequelize.org/docs/v6/)
- [Model API](https://sequelize.org/api/v6/class/src/model.js~Model)
