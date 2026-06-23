import { Module } from "@nestjs/common";
import { BillingCounterController } from "./billing_counter_controller";
import { BillingCounterService } from "./billing_counter_service";
import { BillingCounterProvider } from "./billing_counter_provider";
import { CounterDetailsModule } from "../counter_details/counter_details_module";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule, CounterDetailsModule],
    controllers: [BillingCounterController],
    providers: [BillingCounterService, ...BillingCounterProvider],
    exports: [BillingCounterService]
})
export  class BillingCounterModule {}