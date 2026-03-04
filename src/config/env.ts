import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  NODE_ENV?: string;
}

const config: EnvConfig = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;