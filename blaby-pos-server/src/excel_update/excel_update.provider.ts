
import { ProductMaster } from '../product_master/product_master';
import { ProductCategory } from '../product_category/product_category_entity';

export const excelUpdateProviders = [
  {
    provide: 'productMasterRepository',
    useValue: ProductMaster,
  },
  {
    provide: 'productCategoryRepository',
    useValue: ProductCategory,
  },
  {
    provide: 'SEQUELIZE',
    useFactory: () => ProductMaster.sequelize,
  },
];