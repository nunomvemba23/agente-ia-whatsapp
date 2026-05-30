import path from "node:path";
import { defineConfig } from "prisma/config";
import Database from "better-sqlite3";
import { PrismaBetterSQLite } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = dbUrl.replace(/^file:/, "");

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const database = new Database(dbPath);
      return new PrismaBetterSQLite(database);
    },
  },
});
