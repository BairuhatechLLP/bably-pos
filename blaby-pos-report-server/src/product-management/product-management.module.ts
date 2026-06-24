import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product-category.controller';
import { ProductController } from './product.controller';
import { ProductCategoryService } from './product-category.service';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductCategoryController, ProductController],
  providers: [ProductCategoryService, ProductService],
  exports: [ProductCategoryService, ProductService],
})
export class ProductManagementModule {}
