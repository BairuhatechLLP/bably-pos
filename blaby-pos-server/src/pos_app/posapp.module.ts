import { Module } from "@nestjs/common";
import { PosAppController } from "./posapp.controller";
import { PosAppService } from "./posapp.service";

import { OrderMasterModule } from "../order_master/order_master.module";
import { OrderItemsModule } from "../order_items/order_items.module";

@Module({
  imports: [OrderMasterModule, OrderItemsModule],
  exports: [],
  controllers: [PosAppController],
  providers: [PosAppService],
})
export class PosAppModule {}
