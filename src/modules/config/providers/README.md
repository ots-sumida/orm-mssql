# providers — 接続設定の取得元

プロバイダは **取得元（env / Key Vault 等）ごと** にファイルを分け、いずれも同じ `DbConfig` を返します。  
Sequelize オプションへの変換は `../client/sqlsv-client-config.js` の `buildSequelizeOptions` 経由に統一してください。

| ファイル | 状態 | 取得元 |
|----------|------|--------|
| `env-config-provider.js` | 実装済み | `.env` / `process.env` |
| `keyvault-config-provider.js` | **未実装** | Azure Key Vault |

必須チェック・型変換は `modules/validation/common/well-used-validation.js` を使います（`env-config-provider.js` と同様）。

---

## Key Vault 実装手順

### 1. プロバイダファイルを追加

```
providers/
├── env-config-provider.js
├── keyvault-config-provider.js   ← 追加
└── README.md
```

### 2. `keyvault-config-provider.js` の骨子

```javascript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { assertValid, parseBoolean, parseInteger, requireAllNonEmpty } from '../../validation/common/well-used-validation.js';
import { defaultDbOptions } from '../client/sqlsv-client-config.js';

/**
 * Azure Key Vault から DB 接続設定を取得する。
 *
 * @param {{ vaultUrl: string, secretNames?: Record<string, string>, env?: NodeJS.ProcessEnv }} options
 * @returns {Promise<import('../client/sqlsv-client-config.js').DbConfig>}
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
    env = process.env,
  } = options;

  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());

  const [host, port, database, user, password] = await Promise.all([
    client.getSecret(secretNames.host),
    client.getSecret(secretNames.port),
    client.getSecret(secretNames.database),
    client.getSecret(secretNames.user),
    client.getSecret(secretNames.password),
  ]);

  assertValid(requireAllNonEmpty(
    {
      [secretNames.host]: host.value,
      [secretNames.database]: database.value,
      [secretNames.user]: user.value,
      [secretNames.password]: password.value,
    },
    [secretNames.host, secretNames.database, secretNames.user, secretNames.password],
    { prefix: 'Key Vault に必要なシークレットがありません' },
  ));

  return {
    host: host.value,
    port: Number(port.value ?? '1433'),
    database: database.value,
    user: user.value,
    password: password.value,
    encrypt: parseBoolean(env.DB_ENCRYPT, false),
    trustServerCertificate: parseBoolean(env.DB_TRUST_SERVER_CERTIFICATE, true),
    poolMax: parseInteger(env.DB_POOL_MAX, defaultDbOptions.poolMax),
    poolMin: parseInteger(env.DB_POOL_MIN, defaultDbOptions.poolMin),
    poolAcquire: parseInteger(env.DB_POOL_ACQUIRE, defaultDbOptions.poolAcquire),
    poolIdle: parseInteger(env.DB_POOL_IDLE, defaultDbOptions.poolIdle),
    connectTimeout: parseInteger(env.DB_CONNECT_TIMEOUT, defaultDbOptions.connectTimeout),
    requestTimeout: parseInteger(env.DB_REQUEST_TIMEOUT, defaultDbOptions.requestTimeout),
  };
}
```

### 3. `extractor/config-extractor.js` を接続する

`extractDbConfigFromKeyVault` のスタブを、上記プロバイダ呼び出しに差し替えます。

```javascript
import { loadDbConfigFromKeyVault } from '../providers/keyvault-config-provider.js';

export async function extractDbConfigFromKeyVault(options) {
  return loadDbConfigFromKeyVault(options);
}
```

`modules/config/index.js` から export を追加します。

```javascript
export { loadDbConfigFromKeyVault } from './providers/keyvault-config-provider.js';
```

### 4. 依存パッケージ（本番アプリ側）

```bash
npm install @azure/keyvault-secrets @azure/identity
```

このリポジトリの `modules/` をコピーして使う場合、Azure SDK 依存は **アプリ側** に追加し、プロバイダだけ差し替えてください。

### 5. 接続への渡し方

Key Vault は **非同期** のため、`connect()`（同期・env 固定）をそのまま使えません。  
`createConnectionManager` を直接呼びます。

**ローカル（env）**

```javascript
import { connect } from './modules/db/index.js';

const db = connect(); // 内部で extractDbConfigFromEnv()
```

**本番（Key Vault）**

```javascript
import { createConnectionManager } from './modules/db/index.js';
import { extractDbConfigFromKeyVault } from './modules/config/index.js';

const dbConfig = await extractDbConfigFromKeyVault({
  vaultUrl: process.env.AZURE_KEYVAULT_URL,
});
const db = createConnectionManager(dbConfig);
await db.ensureConnected();
```

### 6. 環境変数の分担（推奨）

| 取得元 | 例 |
|--------|-----|
| Key Vault | `host`, `database`, `user`, `password`（機密） |
| 環境変数 | `DB_POOL_*`, `DB_*_TIMEOUT`, `DB_ENCRYPT`（非機密・チューニング） |
| 環境変数 | `AZURE_KEYVAULT_URL`（Vault の URL のみ） |

機密は Vault、プール・タイムアウトは env のまま、という分担が運用しやすいです。

---

## テスト

| 種類 | 内容 |
|------|------|
| 単体 | Azure SDK をモックした `keyvault-config-provider.test.js` |
| 統合 | 実 Vault への接続は CI / 手動用に分離 |

`env-config-provider` と同様、返却オブジェクトが `DbConfig` 形式であること、`buildSequelizeOptions` 経由で接続できることを確認してください。

---

## やらないこと

- `connection/connection.js` に Key Vault や Azure SDK を直接書かない
- プロバイダごとに Sequelize オプションを組み立てない（必ず `buildSequelizeOptions` 経由）
- シークレット名や Vault URL をコードにハードコードしない（環境変数または引数で渡す）
- `connect()` 本体を Key Vault 対応にしない（同期 / 非同期の混在を避ける）
