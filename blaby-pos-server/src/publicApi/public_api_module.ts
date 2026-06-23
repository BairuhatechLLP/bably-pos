import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { PublicApiController } from "./public_api_controller";
import { PublicApiService } from "./public_api_service";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { AuthModule } from "../auth/auth.module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { ProductMastersModule } from "../product_master/product_master_module";
import { AccountMasterModule } from "../account_master/account_master_module";
import { UserSettingsModule } from "../user_settings/user_settings_module";
import { RetailCustomerModule } from "../retailCustomers/retail_customer_module";
import { ProductLocationMasterModule } from "../product_location_master/product_location.module";
import { ProductCategoryModule } from "../product_category/product_category_module";
import { BankModule } from "../bank/bank_module";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { OtherMasterModule } from "../other_master/other_master.module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";

@Module({
  imports: [
    DatabaseModule,
    SalesInvoicesModule,
    AuthModule,
    ContactMasterModule,
    StaffTransactionsModule,
    ProductMastersModule,
    AccountMasterModule,
    UserSettingsModule,
    RetailCustomerModule,
    ProductLocationMasterModule,
    ProductCategoryModule,
    BankModule,
    LedgerDetailsModule,
    OtherMasterModule,
    PurchaseInvoiceModule
  ],
  controllers: [PublicApiController],
  providers: [PublicApiService],
  exports: [PublicApiService],
})
export class PublicApiModule {}
