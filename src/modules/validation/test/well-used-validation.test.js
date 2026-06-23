import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ValidationError,
  assertValid,
  collectErrors,
  parseBoolean,
  parseInteger,
  requireAllNonEmpty,
  requireNonEmptyString,
} from '../common/well-used-validation.js';

describe('requireNonEmptyString', () => {
  it('未設定のときメッセージを返す', () => {
    assert.equal(requireNonEmptyString('', 'DB_HOST'), 'DB_HOST が未設定です');
    assert.equal(requireNonEmptyString(undefined, 'DB_NAME'), 'DB_NAME が未設定です');
  });

  it('値があるとき null を返す', () => {
    assert.equal(requireNonEmptyString('localhost', 'DB_HOST'), null);
  });
});

describe('requireAllNonEmpty', () => {
  it('prefix 付きで不足項目を列挙する', () => {
    const errors = requireAllNonEmpty(
      { DB_HOST: 'localhost' },
      ['DB_HOST', 'DB_NAME', 'DB_USER'],
      { prefix: 'DB 接続に必要な環境変数が未設定です' },
    );

    assert.deepEqual(errors, [
      'DB 接続に必要な環境変数が未設定です: DB_NAME, DB_USER',
    ]);
  });
});

describe('ValidationError', () => {
  it('文字列配列を保持する', () => {
    const error = new ValidationError(['a', 'b']);
    assert.equal(error.message, 'a; b');
    assert.deepEqual(error.messages, ['a', 'b']);
  });
});

describe('collectErrors / assertValid', () => {
  it('null を除外して収集する', () => {
    assert.deepEqual(collectErrors(null, 'err', undefined), ['err']);
  });

  it('エラーがあると ValidationError を throw する', () => {
    assert.throws(() => assertValid(['bad']), ValidationError);
  });
});

describe('parseBoolean', () => {
  it('空文字のときデフォルト値を返す', () => {
    assert.equal(parseBoolean('', true), true);
    assert.equal(parseBoolean(undefined, false), false);
  });

  it('true/false を解釈する', () => {
    assert.equal(parseBoolean('true', false), true);
    assert.equal(parseBoolean('FALSE', true), false);
  });
});

describe('parseInteger', () => {
  it('空文字のときデフォルト値を返す', () => {
    assert.equal(parseInteger('', 10), 10);
  });

  it('数値文字列を解釈する', () => {
    assert.equal(parseInteger('5000', 0), 5000);
  });

  it('不正な値は ValidationError', () => {
    assert.throws(() => parseInteger('abc', 0), ValidationError);
  });
});
