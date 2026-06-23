import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { ProductionItemsController } from "./production_items.controller";
import { ProductionItemsService } from "./production_items.service";
import { ProductionItemsProviders } from "./production_items.provider";
@Module({
  imports: [DatabaseModule],
  controllers: [ProductionItemsController],
  providers: [ProductionItemsService, ...ProductionItemsProviders],
  exports: [],
})
export class ProductionItemsModule {}
