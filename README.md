# orm-mssql

Node.js + Sequelize + MSSQL の DB 接続モジュールと、Sequelize 学習用サンプルです。

## 概要

| 項目 | 内容 |
|------|------|
| ORM | Sequelize v6 |
| DB | Microsoft SQL Server（tedious ドライバ） |
| 設定 | `.env`（将来 Key Vault 対応を想定した構成） |
| 接続 | コネクションプール・タイムアウト・リトライ無効を明示設定 |

## フォルダ構成

```
src/
├── modules/
│   └── db/                         # 再利用モジュール（他プロジェクトへコピー可）
│       ├── config/
│       │   ├── db-config.js        # DbConfig → Sequelize オプション変換
│       │   └── env-config-provider.js  # .env から設定取得
│       ├── test/                   # 接続設定のテスト
│       ├── sample/                 # Sequelize 学習用サンプル
│       ├── connection.js           # 接続生成・connect()
│       └── index.js                # 公開 API
└── models/                         # このアプリ固有
    ├── tables/
    │   └── user.js                 # テーブル定義（sequelize.define）
    └── user-model.js               # 業務処理（トランザクション対応）
```

### 配置の原則

| 場所 | 中身 |
|------|------|
| `src/modules/` | 他プロジェクトでも使い回せるコード |
| `src/models/` | このアプリのテーブル定義・DB 処理 |

## データの流れ

```
.env
  ↓ env-config-provider.js（取得）
DbConfig
  ↓ db-config.js（Sequelize オプションに変換）
connect() → sequelize
  ↓ tables/user.js（sequelize.define）
User モデル
  ↓ user-model.js（業務処理 + トランザクション）
createUser / createSampleUsers / runUserDemo
```

## 接続モジュール（modules/db）

### 公開 API

```javascript
import { connect } from './modules/db/index.js';

const db = connect();
await db.testConnection();
// ...
await db.close();
```

| 関数 | 役割 |
|------|------|
| `connect()` | `.env` から設定を読み、共有 DB 接続を返す |
| `createConnectionManager(dbConfig)` | DbConfig を渡して接続を生成 |
| `loadDbConfigFromEnv()` | `.env` から DbConfig を取得 |

### 接続設定（Step 2 済）

| 項目 | デフォルト | 環境変数 |
|------|-----------|----------|
| プール最大 | 10 | `DB_POOL_MAX` |
| プール最小 | 0 | `DB_POOL_MIN` |
| プール取得待ち | 30000 ms | `DB_POOL_ACQUIRE` |
| アイドル保持 | 10000 ms | `DB_POOL_IDLE` |
| 接続タイムアウト | 15000 ms | `DB_CONNECT_TIMEOUT` |
| クエリタイムアウト | 60000 ms | `DB_REQUEST_TIMEOUT` |
| リトライ | 無効（max: 0） | — |

詳細は `.env.dist` のコメントを参照。

## モデル層（models）

### tables/user.js — テーブル定義

- `connect()` で DB 接続を取得
- `sequelize.define()` で `users` テーブルを定義
- `User` モデルを export

### user-model.js — 業務処理

- `User` だけ import すれば CRUD 可能（接続は `User` 経由）
- `withTransaction()` で commit / rollback を管理
- `createUser()` は `{ transaction }` オプション対応
- `createSampleUsers()` は複数作成を 1 トランザクションで実行

## サンプル（modules/db/sample）

Sequelize を初めて触る人向け。操作ごとにフォルダ分け、1 ファイル完結で実行・読み比べ可能。

| フォルダ | 内容 |
|----------|------|
| `setup/` | DB 作成 |
| `connect/` | 接続確認 |
| `sync/` | テーブル作成 |
| `create/` | INSERT（create, bulkCreate, findOrCreate 等） |
| `find/` | SELECT（findOne, findAll, Op 条件 等） |
| `update/` | UPDATE（update, save） |
| `delete/` | DELETE（destroy, truncate） |
| `query/` | 生 SQL |
| `transaction/` | トランザクション |

一覧・実行順は [src/modules/db/sample/README.md](src/modules/db/sample/README.md) を参照。

## セットアップ

```bash
npm install
copy .env.dist .env
# .env を編集（DB_HOST, DB_USER, DB_PASSWORD 等）
```

## テスト

```bash
npm test                  # 全部（17 件）
npm run test:db-config    # 単体（プール・タイムアウト・リトライ設定）
npm run test:db-connection # 統合（接続・並列クエリ・requestTimeout）
```

## サンプル実行（初めて触る人向け）

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

その他のサンプルは `package.json` の `sample:*` スクリプト、または [sample/README.md](src/modules/db/sample/README.md) を参照。

## 参考ドキュメント

- [docs/sequelize-operations.md](docs/sequelize-operations.md) — Sequelize 操作リファレンス

## 今後の予定

| Step | 内容 | 状態 |
|------|------|------|
| 1 | 設定分離 + フォルダ構成 | ✅ |
| 2 | プール・タイムアウト・リトライ無効 | ✅ |
| 3 | 自動接続パターン | 未着手 |
| 4 | Docker + 誰でも試せる環境 | 未着手 |
| 5 | 並列デモ、コンマ区切り、Key Vault | 未着手 |
