import { StaffTransactions } from './staff_transactions_entity';

export const StaffTransactionsProvider = [
  {
    provide: 'StaffTransactionsRepository',
    useValue: StaffTransactions,
  },
];
