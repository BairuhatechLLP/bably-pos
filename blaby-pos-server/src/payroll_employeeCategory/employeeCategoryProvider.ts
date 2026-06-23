import { PayrollEmployeeCategory } from './employeeCategoryEntity';

export const employeeCategoryProvider = [
  { provide: 'productcategoryRepository', useValue: PayrollEmployeeCategory },
];
