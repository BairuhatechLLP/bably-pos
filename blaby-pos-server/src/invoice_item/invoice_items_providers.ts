import { InvoiceItem } from './invoice_items_entity';

export const InvoiceItemProviders = [{ provide: 'InvoiceItemRepository', useValue: InvoiceItem }];
