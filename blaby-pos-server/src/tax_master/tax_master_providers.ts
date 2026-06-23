import { Tax } from './tax_master_entity';

export const tax = [{ provide: 'TaxRepository', useValue: Tax }];
