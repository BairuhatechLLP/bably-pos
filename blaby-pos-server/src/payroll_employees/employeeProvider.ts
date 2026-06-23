import { PayrollEmployee } from './employeeEntity';

export const employeesProvider = [
  { provide: 'payrollEmployeeRepository', useValue: PayrollEmployee },
];
