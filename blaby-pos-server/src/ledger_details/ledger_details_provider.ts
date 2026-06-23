import { LedgerDetails  } from './ledger_details';

export const LedgerDetailsProviders = [{ provide: 'LedgerDetailsRepository', useValue: LedgerDetails }];
