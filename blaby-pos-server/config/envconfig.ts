import { Dialect } from 'sequelize/types';
export const config = {
  database: {
    dialect: 'mysql' as Dialect,
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
    pool: {
      max: +(process.env.DB_POOL_MAX || 5),
      min: +(process.env.DB_POOL_MIN || 0), 
      acquire: +(process.env.DB_POOL_ACQUIRE_TIMEOUT || 30000), 
      idle: +(process.env.DB_POOL_IDLE_TIMEOUT || 10000),
    },
    
  },
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  SESSION_EXPIRY: process.env.SESSION_EXPIRY,
  mail: {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    username: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  },
  aws: {
    credentials: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
    },
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET
  },
};
