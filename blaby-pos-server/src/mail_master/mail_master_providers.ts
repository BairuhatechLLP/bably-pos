import { MailMaster } from './mail_master_entity';

export const MailMasterProviders = [
  { provide: 'mailmasterRepository', useValue: MailMaster },
];
