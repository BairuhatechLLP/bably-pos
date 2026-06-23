import { DatabaseModule } from "../database/database.module";
import { Module, forwardRef } from "@nestjs/common";
import { SalesInvoiceController } from "./sale_invoice_controller";
import { SalesInvoiceService } from "./sale_invoice_service";
import { SalesInvoiceProviders } from "./sale_invoice_provider";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { ProductMastersModule } from "../product_master/product_master_module";
import { AccountMasterModule } from "../account_master/account_master_module";
import { MailModule } from "../mail/mail_module";
import { UserSettingsModule } from "../user_settings/user_settings_module";
import { InvoiceItemsModule } from "../invoice_item/invoice_item_module";
import { SalesInvoiceHelperService } from "./sale_invoice_helper_service";
import { ReccuringNotificationModule } from "../reccuring_notification/reccuring_notification_module";
import { BankModule } from "../bank/bank_module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { PaymentModule } from "../Payment/payment.module";
import { StripeLogModule } from "../stripe_log/stripe_log.module";
import { JwtModule } from "@nestjs/jwt";
import { RetailCustomerModule } from "../retailCustomers/retail_customer_module";
import { OtherMasterModule } from '../other_master/other_master.module';
import { ProductLocationMasterModule } from "../product_location_master/product_location.module";
import { OrderMasterModule } from "../order_master/order_master.module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => LedgerDetailsModule),
    forwardRef(() => ProductMastersModule),
    forwardRef(() => AccountMasterModule),
    forwardRef(() => ContactMasterModule),
    forwardRef(() => ReccuringNotificationModule),
    UserSettingsModule,
    MailModule,
    InvoiceItemsModule,
    ReccuringNotificationModule,
    BankModule,
    StaffTransactionsModule,
    RetailCustomerModule,
    forwardRef(() => PaymentModule),
    StripeLogModule,
    JwtModule,
    OtherMasterModule,
    ProductLocationMasterModule,
    OrderMasterModule
  ],
  controllers: [SalesInvoiceController],
  providers: [
    SalesInvoiceService,
    SalesInvoiceHelperService,
    ...SalesInvoiceProviders,
  ],
  exports: [SalesInvoiceService, SalesInvoiceHelperService],
})
export class SalesInvoicesModule {}
