import { Sms } from './entities/sms.entity';

export const smsProviders = [{ provide: 'smsRepository', useValue: Sms }];
