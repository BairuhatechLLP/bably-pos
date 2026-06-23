import { ProductCategory } from './product_category_entity';

export const productcategoryProvider = [
  { provide: 'productcategoryRepository', useValue: ProductCategory },
];
