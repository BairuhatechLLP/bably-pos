import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ContactMasterController } from "./contactMasterController";
import { contactMasterProviders } from "./contactMasterProvider";
import { ContactMasterService } from "./contactMasterService";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";
import { AccountMasterModule } from "../account_master/account_master_module";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { MailModule } from "../mail/mail_module";
import { OtherMasterModule } from "../other_master/other_master.module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => LedgerDetailsModule),
    forwardRef(() => SalesInvoicesModule),
    forwardRef(() => AccountMasterModule),
    forwardRef(() => MailModule),
    PurchaseInvoiceModule,
    StaffTransactionsModule,
    OtherMasterModule
   ],
  controllers: [ContactMasterController],
  providers: [ContactMasterService, ...contactMasterProviders],
  exports: [ContactMasterService],
})
export class ContactMasterModule {}
