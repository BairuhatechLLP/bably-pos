import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserModule } from "./users/user.module";
import { SharedModule } from "./shared/shared.module";
import { CompanyMasterModule } from "./company_master/company_master_module";
import { BusinessCategoryModule } from "./business_category/business_category_module";
import { CountriesModule } from "./countries/countries_module";
import { JournalModule } from "./journal/journal_module";
import { LedgerCategoryGroupModule } from "./ledger_category_group/ledger_category_group_module";
import { AccountMasterModule } from "./account_master/account_master_module";
import { LedgerDetailsModule } from "./ledger_details/ledger_details_module";
import { TaxModule } from "./tax_master/tax_master_module";
import { LedgerCategoryModule } from "./ledger_category/ledger_category_module";
import { PurchaseInvoiceModule } from "./purchase_invoice/purchase_invoice_module";
import { ProductMastersModule } from "./product_master/product_master_module";
import { ReportModule } from "./report/report.module";
import { SalesInvoicesModule } from "./sale_invoice/sale_invoice_module";
import { DashboardModule } from "./dashboard/dashboard_module";
import { BankModule } from "./bank/bank_module";
import { UserSettingsModule } from "./user_settings/user_settings_module";
import { InvoiceNoModule } from "./invoiceno/invoiceno.module";
import { AuditLogModule } from "./audit_log/audit_log_module";
import { AuditLoggingService } from "./audit_log/audit_logging_service";
import { ShareModule } from "./share/share.module";
import { MerchantModule } from "./merchant/merchant_module";
import { ProductCategoryModule } from "./product_category/product_category_module";
import { MailMasterModule } from "./mail_master/mail_master_module";

import { AuthModule } from "./auth/auth.module";
import { UnitModule } from "./units/unit.module";
import { ReccuringNotificationModule } from "./reccuring_notification/reccuring_notification_module";
import { RetailCustomerModule } from "./retailCustomers/retail_customer_module";
import { ProductLocationMasterModule } from "./product_location_master/product_location.module";
import { StockTransferModule } from "./stock_transfer/stock_transfer.module";
import { ScheduleModule } from "@nestjs/schedule";
import { EmployeeCategoryModule } from "./payroll_employeeCategory/employeeCategoryModule";
import { LocationModule } from "./locations/location.module";
import { PayRollEmployeesModule } from "./payroll_employees/employeeModule";
import { ContactusModule } from "./contactus/contactus-module";
import { PayRollPaySheetModule } from "./payroll_paySheet/paySheetModule";
import { PaySheetItemsModule } from "./payroll_paySheetItems/paysheetItemsModule";
import { ContactMasterModule } from "./contactMaster/contactMasterModule";
import { ProposalModule } from "./proposal/proposal_module";
import { ImgcompressModule } from "./image_compress/image_compress.module";
import { RetailModule } from "./retail_express/retail.module";
import { PaymentModule } from "./Payment/payment.module";
import { StaffTransactionsModule } from "./staff_transactions/staff_transactions_module";
import { PublicApiModule } from "./publicApi/public_api_module";
import { BlogModule } from "./blog/blog.module";
import { BillingCounterModule } from "./billing_counter/billing_counter_module";
import { CounterDetailsModule } from "./counter_details/counter_details_module";
import { DataSyncModule } from "./data_sync/dataSync.module";
import { StripeLogModule } from "./stripe_log/stripe_log.module";
import { HsnCodeModule } from "./hsn_code/hsn_code.module";
import { SmsModule } from "./SMS/sms.module";
import { CacheModule } from "@nestjs/cache-manager";
import { PlanModule } from "./PLAN/plan.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { JwtModule } from "@nestjs/jwt";
import { OrderMasterModule } from "./order_master/order_master.module";
import { OrderItemsModule } from "./order_items/order_items.module";
import { AffiliationsModule } from "./affiliations/affiliations-module";
import { BomMasterModule } from "./bom_master/bom_master.module";
import { BomItemsModule } from "./bom_items/bom_items.module";
import { OtherMasterModule } from "./other_master/other_master.module";
import { ProductionMasterModule } from "./production_master/production_master.module";
import { ProductionItemsModule } from "./production_items/production_items.module";
import { DiningTableModule } from "./dining_table/dining_table.module";

import {ReportAppModule} from "./report_app/reportapp.module";
import {PosAppModule} from "./pos_app/posapp.module";
import { KitchenDisplayModule } from "./kitchen_display/kitchen_display.module";
import { ExcelUpdateModule } from "./excel_update/excel_update.module";

@Module({
  imports: [
    UserModule,
    SharedModule,
    CompanyMasterModule,
    BusinessCategoryModule,
    CountriesModule,
    JournalModule,
    LedgerCategoryGroupModule,
    AccountMasterModule,
    LedgerDetailsModule,
    TaxModule,
    LedgerCategoryModule,
    PurchaseInvoiceModule,
    ProductMastersModule,
    SalesInvoicesModule,
    InvoiceNoModule,
    CountriesModule,
    ReportModule,
    DashboardModule,
    BankModule,
    UserSettingsModule,
    AuditLogModule,
    ShareModule,
    MerchantModule,
    ProductCategoryModule,
    MailMasterModule,
    UnitModule,
    ReccuringNotificationModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UnitModule,
    EmployeeCategoryModule,
    LocationModule,
    PayRollEmployeesModule,
    ContactusModule,
    PayRollPaySheetModule,
    PaySheetItemsModule,
    ContactMasterModule,
    ProposalModule,
    ImgcompressModule,
    RetailModule,
    PaymentModule,
    StaffTransactionsModule,
    PublicApiModule,
    BlogModule,
    // DataSyncModule,
    BillingCounterModule,
    CounterDetailsModule,
    StripeLogModule,
    HsnCodeModule,
    SmsModule,
    CacheModule.register({ isGlobal: true }),
    PlanModule,
    SubscriptionsModule,
    JwtModule,
    RetailCustomerModule,
    ProductLocationMasterModule,
    StockTransferModule,
    OrderMasterModule,
    OrderItemsModule,
    AffiliationsModule,
    BomMasterModule,
    BomItemsModule,
    OtherMasterModule,
    ProductionMasterModule,
    ProductionItemsModule,
    DiningTableModule,
    ReportAppModule,
    PosAppModule,
    KitchenDisplayModule,
    ExcelUpdateModule
  ],
  controllers: [],
  providers: [],
})

export class  AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer ) {
    // consumer.apply(AuditLoggingService).forRoutes("*") ;
   }
 }
