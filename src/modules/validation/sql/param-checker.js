'use strict';

const { ValidationError, assertValid, collectErrors } = require('../common/well-used-validation');
const SQL_PARAM_PATTERN = /(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * SQL 内の名前付きパラメータ（:name）を抽出する。
 *
 * @param {string} sql
 * @returns {string[]}
 */
function extractSqlParamNames(sql) {
  const names = new Set();
  const pattern = new RegExp(SQL_PARAM_PATTERN.source, SQL_PARAM_PATTERN.flags);

  for (const match of sql.matchAll(pattern)) {
    names.add(match[1]);
  }

  return [...names];
}

/**
 * SQL と replacements の整合を検証する。
 *
 * @param {string} sql
 * @param {Record<string, unknown> | undefined | null} replacements
 * @param {{ allowExtra?: boolean }} [options]
 * @returns {string[]}
 */
function validateSqlParams(sql, replacements = {}, { allowExtra = false } = {}) {
  const expected = extractSqlParamNames(sql);
  const provided = Object.keys(replacements ?? {});
  const errors = [];

  for (const name of expected) {
    if (!Object.hasOwn(replacements ?? {}, name)) {
      errors.push(`SQL パラメータ :${name} に対応する replacements.${name} がありません`);
      continue;
    }

    const value = replacements[name];
    if (value === undefined) {
      errors.push(`replacements.${name} が undefined です`);
    }
  }

  if (!allowExtra) {
    for (const name of provided) {
      if (!expected.includes(name)) {
        errors.push(`replacements.${name} は SQL 内で使用されていません`);
      }
    }
  }

  return errors;
}

/**
 * @param {string} sql
 * @param {Record<string, unknown> | undefined | null} replacements
 * @param {{ allowExtra?: boolean }} [options]
 */
function assertSqlParamsMatch(sql, replacements = {}, options = {}) {
  assertValid(validateSqlParams(sql, replacements, options));
}

/**
 * @param {string} sql
 * @param {Record<string, unknown> | undefined | null} replacements
 * @param {{ allowExtra?: boolean }} [options]
 * @returns {{ ok: true } | { ok: false, errors: string[] }}
 */
function checkSqlParams(sql, replacements = {}, options = {}) {
  const errors = validateSqlParams(sql, replacements, options);
  if (errors.length === 0) {
    return { ok: true };
  }
  return { ok: false, errors };
}

module.exports = {
  extractSqlParamNames,
  validateSqlParams,
  assertSqlParamsMatch,
  checkSqlParams,
  collectErrors,
  ValidationError,
};
