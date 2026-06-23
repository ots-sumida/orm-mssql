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
 */

export function parseBoolean(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

export function parseInteger(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`数値として解釈できません: ${value}`);
  }

  return parsed;
}

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
    logging: false,
  };
}
