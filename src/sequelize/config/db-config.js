/**
 * @typedef {Object} DbConfig
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 * @property {boolean} encrypt
 * @property {boolean} trustServerCertificate
 */

export function parseBoolean(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
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
    dialectOptions: {
      options: {
        encrypt: dbConfig.encrypt,
        trustServerCertificate: dbConfig.trustServerCertificate,
      },
    },
    logging: false,
  };
}
