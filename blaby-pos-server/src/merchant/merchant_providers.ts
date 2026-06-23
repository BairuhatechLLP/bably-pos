import { Merchant } from './merchant_entity';

export const MerchantProviders = [
  { provide: 'MerchantRepository', useValue: Merchant },
];
