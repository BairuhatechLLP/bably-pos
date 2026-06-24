import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { OrderMaster } from '../entities/order-master.entity';
import { OrderItems } from '../entities/order-items.entity';
import { ProductMaster } from '../entities/product-master.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { CompanyMaster } from '../entities/company-master.entity';
import { User } from '../entities/user.entity';
import { KitchenDisplay } from '../entities/kitchen-display.entity';

// Load environment variables
dotenv.config();

export interface BranchConnection {
  id: number;
  name: string;
  sequelize: Sequelize;
  primaryBranchId: number; // The company ID used in this database
}

export class SequelizeMultiDbConfig {
  private static connections: BranchConnection[] = [];

  static async initializeConnections(): Promise<BranchConnection[]> {
    if (this.connections.length > 0) {
      return this.connections;
    }

    const models = [
      OrderMaster,
      OrderItems,
      ProductMaster,
      ProductCategory,
      CompanyMaster,
      User,
      KitchenDisplay,
    ];

    // Initialize connections for all 7 branches
    for (let i = 1; i <= 7; i++) {
      // Skip if database name is not configured
      const dbName = process.env[`BRANCH${i}_DB_DATABASE`];
      if (!dbName || dbName.trim() === '') {
        continue;
      }

      const host = process.env[`BRANCH${i}_DB_HOST`] || 'localhost';
      const port = parseInt(process.env[`BRANCH${i}_DB_PORT`] || '3306');
      const username = process.env[`BRANCH${i}_DB_USERNAME`] || 'root';
      const password = process.env[`BRANCH${i}_DB_PASSWORD`] || '';

      try {
        const sequelize = new Sequelize({
          dialect: 'mysql',
          host,
          port,
          username,
          password,
          database: dbName,
          logging: false,
          timezone: '+05:30', // India Standard Time
          dialectOptions: {
            timezone: '+05:30',
            connectTimeout: 60000, // 60 seconds for slow/VPN connections
            ssl: {
              // Only disable SSL verification in development
              rejectUnauthorized: process.env.NODE_ENV === 'production',
            },
          },
          pool: {
            max: 10,
            min: 0, // Allow pool to shrink to 0 when idle
            acquire: 60000, // Increased from 30000 to 60000
            idle: 10000,
            evict: 5000, // Check for stale connections every 5 seconds
          },
          retry: {
            max: 3, // Retry failed queries up to 3 times
          },
          models,
        });

        // Test connection
        await sequelize.authenticate();

        const primaryBranchId = parseInt(
          process.env[`BRANCH${i}_PRIMARY_BRANCH_ID`] || '158',
        );
        const branchName = process.env[`BRANCH${i}_NAME`] || `Branch ${i}`;

        this.connections.push({
          id: i,
          name: branchName,
          sequelize,
          primaryBranchId: primaryBranchId,
        });
      } catch (error) {
        // Connection failed - log and skip this branch
        console.error(
          `❌ Failed to connect to Branch ${i} (${process.env[`BRANCH${i}_NAME`] || `Branch ${i}`}):`,
          {
            host,
            port,
            database: dbName,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        );
      }
    }
    return this.connections;
  }

  static getConnections(): BranchConnection[] {
    return this.connections;
  }

  static getConnectionById(branchId: number): BranchConnection | undefined {
    return this.connections.find((conn) => conn.id === branchId);
  }
}
