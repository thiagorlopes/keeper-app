module.exports = {

  "development": {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    database: "keeper_dev",
    dialect: "postgres",
    pool: { maxConnections: 5, maxIdleTime: 30},
  },

  "test": {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    database: "keeper_test",
    dialect: "postgres"
  },

  "production": {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    database: "keeper_prod",
    port: 5432,
    dialect: 'postgres',
    maxConcurrentQueries: 100,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
    },
    pool: { maxConnections: 5, maxIdleTime: 30},
  }
};

