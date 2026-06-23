# Sequelize サンプル

Sequelize を初めて触る人向けの実行サンプルです。  
各ファイルに接続・sync・close の処理をそのまま書いてあるので、1ファイルだけ開いて実行・読み比べできます。

## フォルダ構成

```
sample/
├── setup/          # データベース作成
├── connect/        # 接続確認
├── sync/           # テーブル作成
├── create/         # INSERT
├── find/           # SELECT
├── update/         # UPDATE
└── delete/         # DELETE
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

| フォルダ | ファイル | 学べる API |
|----------|----------|-----------|
| setup | `setup-database.js` | `createDatabaseIfNotExists()` |
| connect | `test-connection.js` | `testConnection()` |
| sync | `sync-table.js` | `User.sync()` |
| create | `create-user.js` | `User.create()` |
| create | `create-users.js` | `User.bulkCreate()` |
| find | `find-user.js` | `findOne`, `findByPk` |
| find | `find-users.js` | `findAll` |
| update | `update-user.js` | `instance.update`, `User.update` |
| delete | `delete-user.js` | `instance.destroy`, `User.destroy` |

## 前提

- `.env` に接続情報が設定されていること
- `setup/setup-database.js` は `master` DB 経由でデータベースを作成します
- CRUD サンプルは `models/tables/user.js` の `User` モデルを使います（このアプリ固有）
