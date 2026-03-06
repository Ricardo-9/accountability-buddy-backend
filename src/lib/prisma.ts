import { PrismaClient } from "@prisma/client/extension";
import { config } from "../config/env.js";
export const prisma = new PrismaClient({
  log:
    config.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
