import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { OrderMasterController } from "./order_master.controller";
import { OrderMasterService } from "./order_master.service";
import { orderMasterProviders } from "./order_master.provider";
import { OrderItemsModule } from "../order_items/order_items.module";

@Module({
  imports: [DatabaseModule,OrderItemsModule],
  controllers: [OrderMasterController],
  providers: [OrderMasterService, ...orderMasterProviders],
  exports: [OrderMasterService],
})
export class OrderMasterModule {}
