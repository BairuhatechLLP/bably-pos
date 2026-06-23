import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BusinessCategoryService } from './business_category_service';
import { BusinessCategoryController } from './business_category_controller';
import { business } from './business_category_providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BusinessCategoryController],
  providers: [BusinessCategoryService, ...business],
  exports: [],
})
export class BusinessCategoryModule {}
