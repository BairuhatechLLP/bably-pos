import { Module, forwardRef } from "@nestjs/common";
import { BillingCounterModule } from "../billing_counter/billing_counter_module";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { CounterDetailsController } from "./counter_details_controller";
import { CounterDetailsProvider } from "./counter_details_provider";
import { CounterDetailsService } from "./counter_details_service";

@Module({
    imports: [forwardRef(() => BillingCounterModule), forwardRef(() => StaffTransactionsModule)],
    controllers: [CounterDetailsController],
    providers: [CounterDetailsService, ...CounterDetailsProvider],
    exports: [CounterDetailsService]
})
export class CounterDetailsModule { }