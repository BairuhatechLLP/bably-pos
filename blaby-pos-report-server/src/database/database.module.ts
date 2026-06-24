import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getBranchDatabaseConfigs } from '../config/database.config';

@Global()
@Module({})
export class DatabaseModule {
  static async forRoot() {
    const branchConfigs = getBranchDatabaseConfigs();
    const dataSources: DataSource[] = [];
    const validConfigs: typeof branchConfigs = [];

    // Create a data source for each configured branch
    for (const branchConfig of branchConfigs) {
      // Skip if database name is not configured
      const dbName = branchConfig.connection.database as string;
      if (
        !dbName ||
        dbName.trim() === '' ||
        (dbName.includes('branch') && dbName.includes('_pos'))
      ) {
        // console.log(`⏭️  Skipping ${branchConfig.name} - No database configured (TypeORM)`);
        continue;
      }

      try {
        // console.log(`\n🔍 ${branchConfig.name} TypeORM Connection Attempt:`);
        // console.log(`   Database: ${dbName}`);

        const dataSource = new DataSource(branchConfig.connection as any);
        await dataSource.initialize();

        dataSources.push(dataSource);
        validConfigs.push(branchConfig);
      } catch (error) {
        // Connection failed - skip this branch
      }
    }

    // console.log(`\n🎯 TypeORM: Successfully connected to ${dataSources.length} branch databases\n`);

    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'BRANCH_DATA_SOURCES',
          useValue: dataSources,
        },
        {
          provide: 'BRANCH_CONFIGS',
          useValue: validConfigs,
        },
      ],
      exports: ['BRANCH_DATA_SOURCES', 'BRANCH_CONFIGS'],
    };
  }
}
