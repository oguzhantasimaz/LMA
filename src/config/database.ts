import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { Borrowing } from "../models/Borrowing";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "library_management",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [User, Book, Borrowing],
  subscribers: [],
  migrations: [],
});

