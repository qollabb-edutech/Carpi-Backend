require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "carpi",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: process.env.DATABASE_PORT || 5432,
    dialect: "postgres",
    logging: false,
    define: {
      paranoid: true,
      timestamps: true,
    },
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 5432,
    dialect: "postgres",
    logging: false,
    define: {
      paranoid: true,
      timestamps: true,
    },
  },
};
