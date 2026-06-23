import { Module } from "@nestjs/common";
import { ReportAppController } from "./reportapp.controller";
import { ReportAppService } from "./reportapp.service";

import { OrderMasterModule } from "../order_master/order_master.module";
import { OrderItemsModule } from "../order_items/order_items.module";

@Module({
  imports: [OrderMasterModule, OrderItemsModule],
  exports: [],
  controllers: [ReportAppController],
  providers: [ReportAppService],
})
export class ReportAppModule {}
