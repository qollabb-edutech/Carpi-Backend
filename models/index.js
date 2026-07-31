import Sequelize from "sequelize";

const PASSWORD = process.env.DATABASE_PASSWORD || "";
const HOST = process.env.DATABASE_HOST || "127.0.0.1";
const USER = process.env.DATABASE_USER || "postgres";
const DATABASE = process.env.DATABASE_NAME || "carpi";
const PORT = Number(process.env.DATABASE_PORT) || 5432;

if (!process.env.DATABASE_PASSWORD) {
  console.warn("Warning: DATABASE_PASSWORD is not set. Check your .env file.");
}

const sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
  host: HOST,
  port: PORT,
  dialect: "postgres",
  logging: false,
  define: {
    paranoid: true,
    timestamps: true,
  },
});

export { Sequelize, sequelize };
