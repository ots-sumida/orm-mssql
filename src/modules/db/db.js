'use strict';

module.exports = {
  // これはレガシーコード(SQL文専用)です
  createLegacySqlDbAccessor: require('./db-legacy-sql/create-db-accessor').createDbAccessor,
};

export {

  createSequelize,

  createConnectionManager,

  createConnectionFromEnv,

  connect,

  disconnect,

} from './connection/connection.js';

export {

  getSequelize,

  registerGracefulShutdown,

  withDb,

} from './connection/auto-connect.js';

export { formatRowAsCsv, formatRowsAsCsv } from './format/csv-format.js';

