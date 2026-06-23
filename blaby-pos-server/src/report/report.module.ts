import { Module, forwardRef } from "@nestjs/common";
import { AccountMasterModule } from "../account_master/account_master_module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { CountriesModule } from "../countries/countries_module";
import { DatabaseModule } from "../database/database.module";
import { InvoiceItemsModule } from "../invoice_item/invoice_item_module";
import { LedgerCategoryModule } from "../ledger_category/ledger_category_module";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { ProductMastersModule } from "../product_master/product_master_module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { TaxModule } from "../tax_master/tax_master_module";
import { UserModule } from "../users/user.module";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { VatReportService } from "./vatReport.service";
import { BalanceSheetService } from "./balanceSheet.service";
import { StockSummaryService } from "./stockSummary.service";
import { CompanyMasterModule } from "../company_master/company_master_module";
import { DayReportService } from "./dayReport.service";
import { JournalModule } from "../journal/journal_module";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { OtherMasterModule } from "../other_master/other_master.module";

@Module({
  imports: [
    ProductMastersModule,
    DatabaseModule,
    forwardRef(() => CompanyMasterModule),
    LedgerDetailsModule,
    forwardRef(() => AccountMasterModule),
    ContactMasterModule,
    LedgerCategoryModule,
    forwardRef(() => UserModule),
    CountriesModule,
    SalesInvoicesModule,
    PurchaseInvoiceModule,
    StaffTransactionsModule,
    TaxModule,
    InvoiceItemsModule,
    forwardRef(() => JournalModule),
    OtherMasterModule
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    VatReportService,
    BalanceSheetService,
    StockSummaryService,
    DayReportService,
  ],
  exports: [ReportService],
})
export class ReportModule {}
