'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { assertSqlParamsMatch,
  checkSqlParams,
  extractSqlParamNames,
  validateSqlParams, } = require('../sql/param-checker');
const { ValidationError } = require('../common/well-used-validation');
describe('extractSqlParamNames', () => {
  it(':name を抽出する', () => {
    const sql = 'SELECT * FROM users WHERE email = :email AND id = :id';
    assert.deepEqual(extractSqlParamNames(sql), ['email', 'id']);
  });

  it('重複は 1 件にまとめる', () => {
    const sql = 'SELECT :x AS a, :x AS b';
    assert.deepEqual(extractSqlParamNames(sql), ['x']);
  });
});

describe('validateSqlParams', () => {
  it('整合しているとき空配列', () => {
    const sql = 'SELECT * FROM users WHERE email = :email';
    assert.deepEqual(validateSqlParams(sql, { email: 'a@b.com' }), []);
  });

  it('不足パラメータを検出する', () => {
    const errors = validateSqlParams('WHERE id = :id', {});
    assert.match(errors[0], /replacements\.id がありません/);
  });

  it('余分な replacements を検出する', () => {
    const errors = validateSqlParams('WHERE id = :id', { id: 1, extra: 2 });
    assert.match(errors[0], /replacements\.extra は SQL 内で使用されていません/);
  });

  it('undefined を検出する', () => {
    const errors = validateSqlParams('WHERE id = :id', { id: undefined });
    assert.match(errors[0], /replacements\.id が undefined です/);
  });

  it('allowExtra で余分なキーを許容する', () => {
    const errors = validateSqlParams(
      'WHERE id = :id',
      { id: 1, extra: 2 },
      { allowExtra: true },
    );
    assert.deepEqual(errors, []);
  });
});

describe('assertSqlParamsMatch / checkSqlParams', () => {
  it('不一致のとき ValidationError', () => {
    assert.throws(
      () => assertSqlParamsMatch('WHERE id = :id', {}),
      ValidationError,
    );
  });

  it('checkSqlParams は ok / errors を返す', () => {
    assert.deepEqual(checkSqlParams('WHERE id = :id', { id: 1 }), { ok: true });
    const result = checkSqlParams('WHERE id = :id', {});
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  });
});
