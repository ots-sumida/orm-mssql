# Sequelize サンプル

Sequelize を初めて触る人向けの実行サンプルです。  
CRUD サンプルは `withDb()` で接続・切断を自動化しています。手動接続の例は `connect/test-connection.js` を参照してください。

## フォルダ構成

```
sample/
├── setup/          # データベース作成
├── connect/        # 接続確認
├── sync/           # テーブル作成
├── create/         # INSERT
├── find/           # SELECT
├── update/         # UPDATE
├── delete/         # DELETE
├── query/          # 生 SQL
└── transaction/    # トランザクション
```

## 実行順（初めて触る人向け）

```bash
npm run sample:setup-database
npm run sample:test-connection
npm run sample:sync-table
npm run sample:create-user
npm run sample:create-users
npm run sample:find-user
npm run sample:find-users
npm run sample:update-user
npm run sample:delete-user
```

## ファイル一覧

### setup / connect / sync

| ファイル | 学べる API | npm コマンド |
|----------|-----------|--------------|
| `setup/setup-database.js` | `createDatabaseIfNotExists()` | `sample:setup-database` |
| `connect/test-connection.js` | `testConnection()`（手動接続） | `sample:test-connection` |
| `connect/with-db.js` | `withDb()`（自動接続） | `sample:with-db` |
| `sync/sync-table.js` | `User.sync()` | `sample:sync-table` |
| `sync/sync-force-table.js` | `User.sync({ force: true })` | `sample:sync-force-table` |

### create

| ファイル | 学べる API | npm コマンド |
|----------|-----------|--------------|
| `create/create-user.js` | `User.create()` | `sample:create-user` |
| `create/create-users.js` | `User.bulkCreate()` | `sample:create-users` |
| `create/find-or-create-user.js` | `User.findOrCreate()` | `sample:find-or-create-user` |
| `create/build-save-user.js` | `User.build()` + `save()` | `sample:build-save-user` |
| `create/upsert-user.js` | `User.upsert()` | `sample:upsert-user` |

### find

| ファイル | 学べる API | npm コマンド |
|----------|-----------|--------------|
| `find/find-user.js` | `findOne`, `findByPk` | `sample:find-user` |
| `find/find-users.js` | `findAll` | `sample:find-users` |
| `find/find-users-where.js` | `Op.like`, `Op.in` | `sample:find-users-where` |
| `find/find-users-options.js` | `attributes`, `limit`, `offset`, `raw` | `sample:find-users-options` |
| `find/find-users-count.js` | `count`, `findAndCountAll` | `sample:find-users-count` |
| `find/find-users-aggregate.js` | `max`, `min`, `sum` | `sample:find-users-aggregate` |
| `find/find-users-parallel.js` | `Promise.all` 並列取得 | `sample:find-users-parallel` |
| `find/find-users-csv.js` | `formatRowAsCsv`, `formatRowsAsCsv` | `sample:find-users-csv` |

### update / delete

| ファイル | 学べる API | npm コマンド |
|----------|-----------|--------------|
| `update/update-user.js` | `instance.update`, `User.update` | `sample:update-user` |
| `update/save-user.js` | `instance.save()` | `sample:save-user` |
| `delete/delete-user.js` | `instance.destroy`, `User.destroy` | `sample:delete-user` |
| `delete/truncate-users.js` | `User.truncate()` | `sample:truncate-users` |

### query / transaction

| ファイル | 学べる API | npm コマンド |
|----------|-----------|--------------|
| `query/query-select.js` | `sequelize.query()` | `sample:query-select` |
| `transaction/transaction-commit.js` | `transaction` + `commit` | `sample:transaction-commit` |
| `transaction/transaction-rollback.js` | `transaction` + `rollback` | `sample:transaction-rollback` |

## 注意

- `sync-force-table.js` / `truncate-users.js` は**データが消えます**（開発環境のみ）
- CRUD サンプルは `models/tables/user.js` の `User` モデルを使います（このアプリ固有）
- `.env` に接続情報が設定されていること
