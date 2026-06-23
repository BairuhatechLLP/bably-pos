import { Module, forwardRef } from "@nestjs/common";
import { StaffTransactionsService } from "./staff_transactions_service";
import { DatabaseModule } from "../database/database.module";
import { StaffTransactionsController } from "./staff_transactions_controller";
import { StaffTransactionsProvider } from "./staff_transactions_provider";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";
import { BillingCounterModule } from "../billing_counter/billing_counter_module";

@Module({
  imports: [DatabaseModule, forwardRef(() =>  SalesInvoicesModule), forwardRef(() =>  PurchaseInvoiceModule), BillingCounterModule],
  controllers: [StaffTransactionsController],
  providers: [StaffTransactionsService, ...StaffTransactionsProvider],
  exports: [StaffTransactionsService],
})
export class StaffTransactionsModule {}
