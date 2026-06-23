# orm-mssql

Node.js + Sequelize + MSSQL の最小構成です。

## 構成

```
src/
├── modules/
│   └── db/                     # 再利用モジュール（他プロジェクトへコピー可）
│       ├── config/
│       ├── sample/             # Sequelize 学習用サンプル（README 参照）
│       ├── connection.js
│       └── index.js
├── models/
│   ├── tables/
│   │   └── user.js
│   └── user-model.js
```

サンプルの詳細は [src/modules/db/sample/README.md](src/modules/db/sample/README.md) を参照してください。

## 使い方

```bash
npm install
copy .env.example .env
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

## DB 接続

```javascript
import { connect } from './modules/db/index.js';

const db = connect();
await db.testConnection();
// ...
await db.close();
```
