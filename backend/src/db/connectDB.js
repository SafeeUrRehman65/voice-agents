import Sequelize from "sequelize";

import dotenv from "dotenv";
dotenv.config();
const db_name = process.env.POSTGRES_DATABASE;
const db_user = process.env.POSTGRES_USERNAME;
const db_password = process.env.POSTGRES_PASSWORD;
const db_host = process.env.POSTGRES_HOST;

// initialize sequelize instance
const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: "postgres",
});

// connect with the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("Connected to Postgres SQL successfully");
  } catch (err) {
    console.err("Connection failed:", err);
  }
};
export { connectDB, sequelize };
