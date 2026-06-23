import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { RetailCustomerController } from "./retail_customers_controller";
import { RetailCustomerService } from "./retail_customer_service";

@Module({
  imports: [DatabaseModule],
  controllers: [RetailCustomerController],
  providers: [RetailCustomerService],
  exports: [RetailCustomerService],
})
export class RetailCustomerModule {}
