'use strict';

/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * @param {Record<string, unknown> | import('sequelize').Model} row
 * @param {string} column
 * @returns {unknown}
 */
function getCellValue(row, column) {
  if (row && typeof row.get === 'function') {
    return row.get(column);
  }
  return row[column];
}

/**
 * 1行をコンマ区切り文字列に変換する。
 *
 * @param {Record<string, unknown> | import('sequelize').Model} row
 * @param {string[]} columns
 * @param {string} [separator=',']
 * @returns {string}
 */
function formatRowAsCsv(row, columns, separator = ',') {
  return columns.map((column) => escapeCsvValue(getCellValue(row, column))).join(separator);
}

/**
 * 複数行をコンマ区切り文字列に変換する（改行区切り）。
 *
 * @param {Array<Record<string, unknown> | import('sequelize').Model>} rows
 * @param {string[]} columns
 * @param {{ separator?: string, header?: boolean }} [options]
 * @returns {string}
 */
function formatRowsAsCsv(rows, columns, { separator = ',', header = false } = {}) {
  const lines = [];

  if (header) {
    lines.push(columns.join(separator));
  }

  for (const row of rows) {
    lines.push(formatRowAsCsv(row, columns, separator));
  }

  return lines.join('\n');
}

module.exports = {
  formatRowAsCsv,
  formatRowsAsCsv,
};
