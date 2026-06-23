import { PayrollPaySheetItem } from './paysheetItemsEntity';

export const paySheetItemProvider = [
  { provide: 'paySheetItemsRepository', useValue: PayrollPaySheetItem },
];
