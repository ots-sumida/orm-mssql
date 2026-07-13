import { parseBoolean, parseInteger } from '../../validation/common/well-used-validation.js';

/**
 * @typedef {Object} DbConfig
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 * @property {boolean} encrypt
 * @property {boolean} trustServerCertificate
 * @property {number} poolMax
 * @property {number} poolMin
 * @property {number} poolAcquire
 * @property {number} poolIdle
 * @property {number} connectTimeout
 * @property {number} requestTimeout
 * @property {boolean} logging
 */

export { parseBoolean, parseInteger };

/** @type {Pick<DbConfig, 'poolMax' | 'poolMin' | 'poolAcquire' | 'poolIdle' | 'connectTimeout' | 'requestTimeout'>} */
export const defaultDbOptions = {
  poolMax: 10,
  poolMin: 0,
  poolAcquire: 30000,
  poolIdle: 10000,
  connectTimeout: 15000,
  requestTimeout: 60000,
};

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatSqlLiteral(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (value instanceof Date) {
    return `N'${value.toISOString().replace(/'/g, "''")}'`;
  }
  if (Buffer.isBuffer(value)) {
    return `0x${value.toString('hex')}`;
  }
  return `N'${String(value).replace(/'/g, "''")}'`;
}

/**
 * @param {string} sql
 * @param {Record<string, unknown> | unknown[]} parameters
 * @returns {string}
 */
export function inlineSqlParameters(sql, parameters) {
  if (!parameters || typeof parameters !== 'object') {
    return sql;
  }

  let result = sql;

  if (Array.isArray(parameters)) {
    for (let i = 0; i < parameters.length; i += 1) {
      const literal = formatSqlLiteral(parameters[i]);
      result = result.replace(new RegExp(`@${i}\\b`, 'g'), literal);
      result = result.replace(new RegExp(`@param${i}\\b`, 'g'), literal);
    }
    return result;
  }

  for (const [key, value] of Object.entries(parameters)) {
    const literal = formatSqlLiteral(value);
    result = result.replace(new RegExp(`@${key}\\b`, 'gi'), literal);
    result = result.replace(new RegExp(`:${key}\\b`, 'g'), literal);
  }

  return result;
}

/**
 * @param {import('sequelize').QueryOptions} options
 * @param {string} sql
 * @returns {string}
 */
export function resolveExecutableSql(options, sql) {
  let executableSql = sql;

  if (options.replacements) {
    executableSql = inlineSqlParameters(executableSql, options.replacements);
  }
  if (options.bind) {
    executableSql = inlineSqlParameters(executableSql, options.bind);
  }

  return executableSql;
}

/**
 * @param {import('sequelize').QueryOptions} options
 * @param {string} sql
 * @returns {boolean}
 */
export function shouldSkipSqlLog(options, sql) {
  if (options.type === 'SHOWTABLES' || options.type === 'SHOWINDEXES' || options.type === 'VERSION') {
    return true;
  }

  return /SELECT\s+1\s*\+\s*1\s+AS\s+result/i.test(sql)
    || /SERVERPROPERTY\s*\(\s*'ProductVersion'\s*\)/i.test(sql);
}

/**
 * @param {import('sequelize').Sequelize} sequelize
 */
export function attachSqlDebugLogging(sequelize) {
  sequelize.addHook('afterQuery', (options, query) => {
    if (!query.sql) {
      return;
    }

    const sql = resolveExecutableSql(options, query.sql);
    if (shouldSkipSqlLog(options, sql)) {
      return;
    }

    console.log(`[SQL] ${sql}`);
  });
}

/**
 * @param {boolean} enabled
 * @returns {false}
 */
export function resolveSequelizeLogging(enabled) {
  return enabled ? false : false;
}

/**
 * @param {DbConfig} dbConfig
 * @returns {import('sequelize').Options}
 */
export function buildSequelizeOptions(dbConfig) {
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mssql',
    pool: {
      max: dbConfig.poolMax,
      min: dbConfig.poolMin,
      acquire: dbConfig.poolAcquire,
      idle: dbConfig.poolIdle,
    },
    dialectOptions: {
      options: {
        encrypt: dbConfig.encrypt,
        trustServerCertificate: dbConfig.trustServerCertificate,
        connectTimeout: dbConfig.connectTimeout,
        requestTimeout: dbConfig.requestTimeout,
      },
    },
    retry: {
      max: 0,
    },
    logging: resolveSequelizeLogging(dbConfig.logging),
    logQueryParameters: false,
  };
}
