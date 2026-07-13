'use strict';

/**
 * バリデーション失敗時に throw するエラー。
 * messages は文字列または文字列配列を受け取る。
 */
class ValidationError extends Error {
  /** @param {string | string[]} messages */
  constructor(messages) {
    const list = Array.isArray(messages) ? messages : [messages];
    super(list.join('; '));
    this.name = 'ValidationError';
    this.messages = list;
  }
}

/**
 * @param {unknown} value
 * @param {string} fieldName
 * @returns {string | null} エラーメッセージ。問題なければ null
 */
function requireNonEmptyString(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} が未設定です`;
  }
  return null;
}

/**
 * 複数フィールドの必須チェック。
 *
 * @param {Record<string, unknown>} values
 * @param {string[]} fieldNames
 * @param {{ prefix?: string }} [options]
 * @returns {string[]}
 */
function requireAllNonEmpty(values, fieldNames, { prefix = '' } = {}) {
  const errors = [];

  for (const fieldName of fieldNames) {
    const error = requireNonEmptyString(values[fieldName], fieldName);
    if (error) {
      errors.push(error);
    }
  }

  if (errors.length === 0) {
    return errors;
  }

  if (!prefix) {
    return errors;
  }

  return [`${prefix}: ${errors.map((message) => message.replace(/ が未設定です$/, '')).join(', ')}`];
}

/**
 * @param {Array<string | null | undefined | false>} results
 * @returns {string[]}
 */
function collectErrors(...results) {
  return results.flat().filter((value) => typeof value === 'string' && value.length > 0);
}

/**
 * @param {string[]} errors
 */
function assertValid(errors) {
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * @param {string | undefined} value
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
function parseBoolean(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

/**
 * @param {string | undefined} value
 * @param {number} defaultValue
 * @returns {number}
 */
function parseInteger(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`数値として解釈できません: ${value}`);
  }

  return parsed;
}

module.exports = {
  requireNonEmptyString,
  requireAllNonEmpty,
  collectErrors,
  assertValid,
  parseBoolean,
  parseInteger,
  ValidationError,
};
