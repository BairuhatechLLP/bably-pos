import { DatabaseModule } from "../database/database.module";
import { Module, forwardRef } from "@nestjs/common";
import { ProductMasterController } from "./product_master_controller";
import { ProductMasterService } from "./product_master_service";
import { ProductMasterProviders } from "./product_master_provider";
import { MailModule } from "../mail/mail_module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { PurchaseInvoiceProvider } from "../purchase_invoice/purchase_invoice_provider";
import { InvoiceItemsModule } from "../invoice_item/invoice_item_module";
import { SalesInvoiceProviders } from "../sale_invoice/sale_invoice_provider";
import { AccountMasterModule } from "../account_master/account_master_module";
import { ProductLocationMasterModule } from "../product_location_master/product_location.module";
@Module({
  imports: [
    DatabaseModule,
    MailModule,
    InvoiceItemsModule,
    forwardRef(() => PurchaseInvoiceModule),
    forwardRef(() => SalesInvoicesModule),
    forwardRef(() => AccountMasterModule),
    forwardRef(() => ProductLocationMasterModule),
  ],
  controllers: [ProductMasterController],
  providers: [
    ProductMasterService,
    ...ProductMasterProviders,
    ...PurchaseInvoiceProvider,
    ...SalesInvoiceProviders,
  ],
  exports: [ProductMasterService],
})
export class ProductMastersModule {}
