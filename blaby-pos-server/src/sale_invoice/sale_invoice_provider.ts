import { SaleInvoice  } from './sale_invoice';

export const SalesInvoiceProviders = [{ provide: 'SalesInvoiceRepository', useValue: SaleInvoice }];
