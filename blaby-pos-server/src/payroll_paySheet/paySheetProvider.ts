import { PayrollPaySheet } from './paySheetEntity';

export const paySheetProvider = [
  { provide: 'payrollPaySheetRepository', useValue: PayrollPaySheet },
];
