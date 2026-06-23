import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product_category_controller';
import { ProductCategoryService } from './product_category_services';
import { productcategoryProvider } from './product_category_provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, ...productcategoryProvider],
  exports: [ProductCategoryService],
})
export class ProductCategoryModule {}
