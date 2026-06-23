import { createConnectionManager, loadDbConfigFromEnv } from './sequelize/index.js';

const dbConfig = loadDbConfigFromEnv();

/** @type {ReturnType<typeof createConnectionManager>} */
export const db = createConnectionManager(dbConfig);

export const sequelize = db.sequelize;
