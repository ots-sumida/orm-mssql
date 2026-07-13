'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatRowAsCsv, formatRowsAsCsv } = require('../format/csv-format');
describe('formatRowAsCsv', () => {
  it('指定列をコンマ区切りで返す', () => {
    const row = { id: 1, name: '山田太郎', email: 'taro@example.com' };
    assert.equal(formatRowAsCsv(row, ['id', 'name', 'email']), '1,山田太郎,taro@example.com');
  });

  it('カンマ・ダブルクォートを含む値はエスケープする', () => {
    const row = { id: 2, name: '佐藤,花子', email: 'hanako@example.com' };
    assert.equal(formatRowAsCsv(row, ['id', 'name', 'email']), '2,"佐藤,花子",hanako@example.com');
  });

  it('null / undefined は空文字', () => {
    const row = { id: 3, name: null, email: undefined };
    assert.equal(formatRowAsCsv(row, ['id', 'name', 'email']), '3,,');
  });
});

describe('formatRowsAsCsv', () => {
  it('複数行を改行区切りで返す', () => {
    const rows = [
      { id: 1, name: '山田太郎', email: 'taro@example.com' },
      { id: 2, name: '佐藤花子', email: 'hanako@example.com' },
    ];
    assert.equal(
      formatRowsAsCsv(rows, ['id', 'name', 'email']),
      '1,山田太郎,taro@example.com\n2,佐藤花子,hanako@example.com',
    );
  });

  it('header: true でヘッダー行を付ける', () => {
    const rows = [{ id: 1, name: '山田太郎', email: 'taro@example.com' }];
    assert.equal(
      formatRowsAsCsv(rows, ['id', 'name', 'email'], { header: true }),
      'id,name,email\n1,山田太郎,taro@example.com',
    );
  });
});
