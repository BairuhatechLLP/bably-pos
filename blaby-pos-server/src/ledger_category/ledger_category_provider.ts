import { LedgerCategory } from './ledger_category_model';

export const LedgerCategoryProviders = [{ provide: 'LedgerCategoryRepository', useValue: LedgerCategory }];
