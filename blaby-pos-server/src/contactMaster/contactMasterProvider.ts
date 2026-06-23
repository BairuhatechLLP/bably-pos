import { ContactMaster  } from './contactMasterModel';

export const contactMasterProviders = [{ provide: 'contactMasterRepository', useValue: ContactMaster }];
