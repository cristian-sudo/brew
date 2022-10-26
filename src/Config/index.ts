import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

export default {
  environment: process.env.NODE_ENV,
  app_secret: process.env.APP_SECRET,
  baseUrl: process.env.APP_BASE_URL,

  express: {
    port: Number(process.env.EXPRESS_PORT),
  },

  db: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  },

  jwt: {
    secret_key: readFileSync(`${process.cwd()}${process.env.JWT_SECRET_KEY}`, 'utf-8'),
    public_key: readFileSync(`${process.cwd()}${process.env.JWT_PUBLIC_KEY}`, 'utf-8'),
    passphrase: process.env.JWT_PASSPHRASE,
    dev_timer: Number(process.env.JWT_DEV_EXPIRATION),
    prod_timer: Number(process.env.JWT_PROD_EXPIRATION),
  },

  email: {
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    admin_email: 'admin@intercambio.com',
    support_email: 'support@intercambio.com',
  },
};
