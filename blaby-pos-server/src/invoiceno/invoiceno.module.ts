import { Global, Module } from '@nestjs/common';
import { PurchaseInvoiceProvider } from '../purchase_invoice/purchase_invoice_provider';
import { SalesInvoiceProviders } from '../sale_invoice/sale_invoice_provider';
import { InvoiceNoService } from './invoiceno.service';

@Global()
@Module({
    providers: [InvoiceNoService, ...PurchaseInvoiceProvider, ...SalesInvoiceProviders],
    exports: [InvoiceNoService],
    imports: [],
    controllers: [],
})
export class InvoiceNoModule {}
