# orm-mssql

Node.js + Sequelize + MSSQL の最小構成です。

## 構成

```
src/
├── sequelize/              # 再利用モジュール（他プロジェクトへコピー可）
│   ├── config/
│   │   ├── db-config.js           # 設定 → Sequelize オプション変換
│   │   └── env-config-provider.js # .env から設定取得
│   ├── connection.js       # 接続生成・接続管理
│   └── index.js            # 公開 API
├── db.js                   # アプリ配線（env 取得 → connection 生成）
├── models/
│   ├── user.js             # テーブル定義（アプリ固有）
│   └── user-model.js       # 業務処理（作成・取得・更新）
├── demo.js                 # 取得・更新デモ
├── create-demo.js          # 作成デモ
├── setup-db.js             # DB作成
└── test-db.js              # 接続確認
```

## 使い方

```bash
npm install
copy .env.example .env
npm run setup:db
npm run test:db
npm run demo:create   # レコード作成
npm run demo          # 取得・更新・全件表示
```
