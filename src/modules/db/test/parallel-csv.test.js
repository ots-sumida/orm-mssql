'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
const { connect, disconnect } = require('../db');
const { User } = require('../../../models/tables/user');
const { findUsersByIdsParallel,
  listAllUsersAsCsv,
  findUserAsCsv, } = require('../../../models/user-model');
dotenv.config();

function hasDbEnv() {
  return Boolean(
    process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD,
  );
}

describe('並列取得・CSV 返却', { skip: !hasDbEnv() && 'DB 環境変数が未設定のためスキップ' }, () => {
  before(async () => {
    const db = connect();
    await db.ensureConnected();
    await User.sync();
  });

  after(async () => {
    await disconnect();
  });

  it('findUsersByIdsParallel で複数 ID を並列取得できる', async () => {
    const users = await findUsersByIdsParallel([1, 2]);
    assert.ok(users.length >= 1);
    assert.ok(users.every((user) => user.id));
  });

  it('listAllUsersAsCsv はコンマ区切り文字列を返す', async () => {
    const csv = await listAllUsersAsCsv();
    assert.match(csv, /^id,name,email/);
    assert.match(csv, /\d+,/);
  });

  it('findUserAsCsv は1行のコンマ区切りを返す', async () => {
    const csv = await findUserAsCsv('taro@example.com');
    if (csv) {
      assert.match(csv, /^\d+,.+,.+@.+/);
    }
  });
});
