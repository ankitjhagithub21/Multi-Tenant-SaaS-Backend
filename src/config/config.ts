import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret:string;
  frontendUrl:string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret:process.env.JWT_SECRET || "your_secret_key",
  frontendUrl:process.env.FRONTEND_URL || 'http://localhost:3000'
};

export default config;