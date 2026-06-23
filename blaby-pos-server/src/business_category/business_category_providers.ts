import { BusinessCategory } from './business_category_entity';
export const business = [
  { provide: 'BusinessCategoryRepository', useValue: BusinessCategory },
];
