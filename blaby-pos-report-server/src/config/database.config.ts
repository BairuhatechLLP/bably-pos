import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export interface BranchConfig {
  id: number;
  name: string;
  connection: TypeOrmModuleOptions;
}

export const getBranchDatabaseConfigs = (): BranchConfig[] => {
  const branches: BranchConfig[] = [];

  for (let i = 1; i <= 7; i++) {
    const dbName = process.env[`BRANCH${i}_DB_DATABASE`] || `branch${i}_pos`;
    const host = process.env[`BRANCH${i}_DB_HOST`] || 'localhost';
    const username = process.env[`BRANCH${i}_DB_USERNAME`] || 'root';
    const password = process.env[`BRANCH${i}_DB_PASSWORD`] || '';

    branches.push({
      id: i,
      name: process.env[`BRANCH${i}_NAME`] || `Branch ${i}`,
      connection: {
        type: 'mysql',
        host,
        port: parseInt(process.env[`BRANCH${i}_DB_PORT`] || '3306'),
        username,
        password,
        database: dbName,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Set to false for production
        logging: true, // Enable logging to see queries
        // Optimized connection pooling and database selection
        extra: {
          connectionLimit: 10, // Max connections per branch
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        },
        // Query result caching
        cache: {
          duration: 5000, // Cache query results for 5 seconds
        },
      },
    });
  }

  return branches;
};
