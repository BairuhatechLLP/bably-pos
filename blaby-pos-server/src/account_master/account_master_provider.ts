import { AccountMaster  } from './account_master';

export const AccountMasterProviders = [{ provide: 'AccountMasterRepository', useValue: AccountMaster }];
