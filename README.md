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
│   ├── config/
│   │   ├── config.js
│   │   ├── extractor/
│   │   │   └── config-extractor.js
│   │   ├── client/
│   │   │   └── sqlsv-client-config.js
│   │   └── providers/
│   │       └── env-config-provider.js
│   ├── validation/
│   │   ├── validation.js
│   │   ├── common/
│   │   │   └── well-used-validation.js
│   │   └── sql/
│   │       └── param-checker.js
│   └── db/
│       ├── db.js
│       ├── connection/
│       │   ├── connection.js
│       │   └── auto-connect.js
│       ├── format/
│       │   └── csv-format.js
│       ├── test/
│       └── sample/
└── models/
    ├── tables/
    │   └── user.js
    └── user-model.js
```

### 配置の原則

| 場所 | 中身 |
|------|------|
| `src/modules/` | 他プロジェクトでも使い回せるコード |
| `src/models/` | このアプリのテーブル定義・DB 処理 |

## データの流れ

```
.env
  ↓ extractor / providers（取得）
DbConfig
  ↓ client/sqlsv-client-config.js（Sequelize オプションに変換）
connect() → sequelize
  ↓ tables/user.js（sequelize.define）
User モデル
  ↓ user-model.js（業務処理 + トランザクション）
createUser / createSampleUsers / runUserDemo
```

## 接続モジュール（modules/db）

### 公開 API

**ワンショットスクリプト（推奨）**

```javascript
import { withDb } from './modules/db/db.js';

await withDb(async (db) => {
  // ensureConnected 済み。Sequelize 操作はここに書く
  await db.sequelize.query('SELECT 1');
});
// 処理後は自動 disconnect
```

**長時間稼働アプリ**

```javascript
import { connect, registerGracefulShutdown } from './modules/db/db.js';

const db = connect();
registerGracefulShutdown(db);
// SIGINT / SIGTERM で自動 close
```

**手動接続（接続確認サンプル用）**

```javascript
import { connect, disconnect } from './modules/db/db.js';

const db = connect();
await db.testConnection();
// ...
await disconnect();
```

| 関数 | 役割 |
|------|------|
| `connect()` | `.env` から設定を読み、共有 DB 接続を返す |
| `ensureConnected()` | 接続を確立（初回のみ authenticate、以降は再利用） |
| `withDb(fn)` | 接続確認 → 処理 → 切断をまとめて実行 |
| `getSequelize()` | 共有 Sequelize インスタンスを返す |
| `disconnect()` | 共有接続を閉じてシングルトンをリセット |
| `registerGracefulShutdown(db)` | プロセス終了時に自動 close |
| `createConnectionManager(dbConfig)` | DbConfig を渡して接続を生成 |
| `loadDbConfigFromEnv()` | `.env` から DbConfig を取得 |
| `formatRowAsCsv(row, columns)` | 1行をコンマ区切り文字列に変換 |
| `formatRowsAsCsv(rows, columns, options)` | 複数行をコンマ区切り文字列に変換 |

### コンマ区切り返却

```javascript
import { formatRowAsCsv, formatRowsAsCsv } from './modules/db/db.js';

const row = { id: 1, name: '山田太郎', email: 'taro@example.com' };
formatRowAsCsv(row, ['id', 'name', 'email']);
// => "1,山田太郎,taro@example.com"

formatRowsAsCsv([row], ['id', 'name', 'email'], { header: true });
// => "id,name,email\n1,山田太郎,taro@example.com"
```

カンマ・ダブルクォートを含む値は自動エスケープします。

### 並列処理

コネクションプール（`pool.max`）経由で `Promise.all` による並列クエリが可能です。  
同時実行数が `pool.max` を超えると、空き接続が出るまで `pool.acquire`（デフォルト 30 秒）待ちします。

```javascript
await Promise.all([
  User.findByPk(1),
  User.findByPk(2),
  User.findByPk(3),
]);
```

サンプル: `npm run sample:find-users-parallel`

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
- `findUsersByIdsParallel(ids)` — `Promise.all` で並列取得
- `listAllUsersAsCsv()` / `findUserAsCsv(email)` — コンマ区切り返却

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
npm test                  # 全部
npm run test:db-config    # 単体（プール・タイムアウト・リトライ設定）
npm run test:db-connection # 統合（接続・並列クエリ・requestTimeout）
npm run test:auto-connect # 自動接続（ensureConnected / withDb）
npm run test:csv-format   # コンマ区切り（単体）
npm run test:parallel-csv # 並列取得・CSV 返却（統合）
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
| 3 | 自動接続パターン | ✅ |
| 4 | Docker + 誰でも試せる環境 | スキップ |
| 5 | 並列デモ、コンマ区切り | ✅ |
| — | Key Vault プロバイダ | 未着手 |
