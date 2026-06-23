import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard_controller';
import { DashboardService } from './dashboard_service';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { SalesInvoicesModule } from '../sale_invoice/sale_invoice_module';
import { PurchaseInvoiceModule } from '../purchase_invoice/purchase_invoice_module';
import { StaffTransactionsModule } from '../staff_transactions/staff_transactions_module';

@Module({
    imports: [DatabaseModule, LedgerDetailsModule,SalesInvoicesModule,PurchaseInvoiceModule,StaffTransactionsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: []
})
export class DashboardModule {}
