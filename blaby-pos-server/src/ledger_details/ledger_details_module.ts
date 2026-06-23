import { Module, forwardRef } from '@nestjs/common';
import { AccountMasterModule } from '../account_master/account_master_module';
import { ContactMasterModule } from '../contactMaster/contactMasterModule';
import { DatabaseModule } from '../database/database.module';
import { LedgerDetailsController } from './ledger_details_controller';
import { LedgerDetailsProviders } from './ledger_details_provider';
import { LedgerDetailsService } from './ledger_details_service';
import { SalesInvoicesModule } from '../sale_invoice/sale_invoice_module';
import { PurchaseInvoiceModule } from '../purchase_invoice/purchase_invoice_module';
import { BankModule } from '../bank/bank_module';
import { OtherMasterModule } from '../other_master/other_master.module';

@Module({
  imports: [
    DatabaseModule,
    ContactMasterModule,
    SalesInvoicesModule,
    PurchaseInvoiceModule,
    forwardRef(() => AccountMasterModule),
    PurchaseInvoiceModule,
    BankModule,
    OtherMasterModule
  ],
  controllers: [LedgerDetailsController],
  providers: [LedgerDetailsService, ...LedgerDetailsProviders],
  exports: [LedgerDetailsService],
})
export class LedgerDetailsModule {}
