import "dotenv/config";
import { defineConfig } from "prisma/config";
import { config } from "./src/config/env.js";

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: config.DATABASE_URL,
  },
});
