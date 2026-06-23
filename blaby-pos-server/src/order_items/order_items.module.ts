import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { OrderItemsController } from "./order_items.controller";
import { orderItemsProviders } from "./order_items.provider";
import { OrderItemsService } from "./order_items.service";

@Module({
  imports: [DatabaseModule],
  controllers: [OrderItemsController],
  providers: [OrderItemsService, ...orderItemsProviders],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
