# config — DB 設定の取得と変換

このフォルダは **「設定をどこから取るか」** と **「Sequelize に渡す形に変換するか」** を分離するための場所です。

## ファイル構成（現状）

| ファイル | 責務 |
|----------|------|
| `env-config-provider.js` | **とってくる** — `.env` / `process.env` から `DbConfig` を取得 |
| `db-config.js` | **渡す** — `DbConfig` を Sequelize オプションに変換 |

```
.env / Key Vault / その他
        ↓ プロバイダ（取得）
     DbConfig
        ↓ db-config.js（変換）
 Sequelize オプション
        ↓ connection.js
     接続生成
```

## 設計原則

1. **プロバイダは `DbConfig` を返すだけ** — Sequelize や `dotenv` を `connection.js` に持ち込まない
2. **`connection.js` は `DbConfig` だけ受け取る** — 取得元（env / Key Vault）を知らない
3. **アプリ側でプロバイダを選ぶ** — ローカルは env、本番は Key Vault など

## DbConfig 形式

すべてのプロバイダは同じオブジェクト形式を返してください（`db-config.js` の typedef 参照）。

```javascript
{
  host: string,
  port: number,
  database: string,
  user: string,
  password: string,
  encrypt: boolean,
  trustServerCertificate: boolean,
  poolMax: number,
  poolMin: number,
  poolAcquire: number,
  poolIdle: number,
  connectTimeout: number,
  requestTimeout: number,
}
```

プール・タイムアウトのデフォルト値は `db-config.js` の `defaultDbOptions` を使います。

---

## Key Vault 実装時の手順

### 1. プロバイダファイルを追加

```
config/
├── db-config.js
├── env-config-provider.js
└── keyvault-config-provider.js   ← 追加
```

### 2. `keyvault-config-provider.js` の骨子

```javascript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { defaultDbOptions, parseBoolean, parseInteger } from './db-config.js';

/**
 * Azure Key Vault から DB 接続設定を取得する。
 *
 * @param {{ vaultUrl: string, secretNames?: Record<string, string> }} options
 * @returns {Promise<import('./db-config.js').DbConfig>}
 */
export async function loadDbConfigFromKeyVault(options) {
  const {
    vaultUrl,
    secretNames = {
      host: 'db-host',
      port: 'db-port',
      database: 'db-name',
      user: 'db-user',
      password: 'db-password',
    },
  } = options;

  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());

  const [host, port, database, user, password] = await Promise.all([
    client.getSecret(secretNames.host),
    client.getSecret(secretNames.port),
    client.getSecret(secretNames.database),
    client.getSecret(secretNames.user),
    client.getSecret(secretNames.password),
  ]);

  // 必須チェック
  const missing = [];
  if (!host.value) missing.push(secretNames.host);
  if (!database.value) missing.push(secretNames.database);
  if (!user.value) missing.push(secretNames.user);
  if (!password.value) missing.push(secretNames.password);
  if (missing.length > 0) {
    throw new Error(`Key Vault に必要なシークレットがありません: ${missing.join(', ')}`);
  }

  return {
    host: host.value,
    port: Number(port.value ?? '1433'),
    database: database.value,
    user: user.value,
    password: password.value,
    encrypt: parseBoolean(process.env.DB_ENCRYPT, false),
    trustServerCertificate: parseBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, true),
    poolMax: parseInteger(process.env.DB_POOL_MAX, defaultDbOptions.poolMax),
    poolMin: parseInteger(process.env.DB_POOL_MIN, defaultDbOptions.poolMin),
    poolAcquire: parseInteger(process.env.DB_POOL_ACQUIRE, defaultDbOptions.poolAcquire),
    poolIdle: parseInteger(process.env.DB_POOL_IDLE, defaultDbOptions.poolIdle),
    connectTimeout: parseInteger(process.env.DB_CONNECT_TIMEOUT, defaultDbOptions.connectTimeout),
    requestTimeout: parseInteger(process.env.DB_REQUEST_TIMEOUT, defaultDbOptions.requestTimeout),
  };
}
```

### 3. 依存パッケージ（本番アプリ側）

```bash
npm install @azure/keyvault-secrets @azure/identity
```

このリポジトリの `modules/db` をコピーして使う場合、Key Vault 依存は **アプリ側** に追加し、プロバイダだけ差し替えてください。

### 4. 接続への渡し方

Key Vault は **非同期** のため、`connect()` をそのまま使えない場合があります。  
そのときは `createConnectionManager` を直接呼びます。

**ローカル（現状）**

```javascript
import { connect } from './modules/db/index.js';

const db = connect(); // 内部で loadDbConfigFromEnv()
```

**本番（Key Vault）**

```javascript
import { createConnectionManager } from './modules/db/index.js';
import { loadDbConfigFromKeyVault } from './modules/db/config/keyvault-config-provider.js';

const dbConfig = await loadDbConfigFromKeyVault({
  vaultUrl: process.env.AZURE_KEYVAULT_URL,
});
const db = createConnectionManager(dbConfig);
await db.ensureConnected();
```

### 5. 環境変数の分担（推奨）

| 取得元 | 例 |
|--------|-----|
| Key Vault | `host`, `database`, `user`, `password`（機密） |
| 環境変数 | `DB_POOL_*`, `DB_*_TIMEOUT`, `DB_ENCRYPT`（非機密・チューニング） |
| 環境変数 | `AZURE_KEYVAULT_URL`（Vault の URL のみ） |

機密は Vault、プール・タイムアウトは env のまま、という分担が運用しやすいです。

### 6. `index.js` への export

実装後、`src/modules/db/index.js` から export を追加します。

```javascript
export { loadDbConfigFromKeyVault } from './config/keyvault-config-provider.js';
```

`connect()` 本体は **env 固定のまま** にし、Key Vault を使うアプリは上記のように `createConnectionManager` を呼ぶ形を推奨します（同期 / 非同期の混在を避けるため）。

---

## テスト

| 種類 | 内容 |
|------|------|
| 単体 | `db-config.test.js` — `parseBoolean`, `buildSequelizeOptions` 等 |
| 統合 | `connection.test.js` — 実 DB 接続（env プロバイダ経由） |

Key Vault プロバイダ追加時は、Azure SDK をモックした単体テストを `config/keyvault-config-provider.test.js` に追加してください。  
実 Vault への統合テストは CI / 手動用に分離するのがよいです。

---

## やらないこと

- `connection.js` に Key Vault や `dotenv` を直接書かない
- プロバイダごとに Sequelize オプションを組み立てない（必ず `buildSequelizeOptions` 経由）
- シークレット名や Vault URL をコードにハードコードしない（環境変数または引数で渡す）
