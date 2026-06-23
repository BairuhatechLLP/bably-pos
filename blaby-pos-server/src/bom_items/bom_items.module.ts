import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { BomItemsController } from "./bom_items.controller";
import { BomItemsService } from "./bom_items.service";
import { BomItemsProviders } from "./bom_items.provider";

@Module({
  imports: [DatabaseModule],
  controllers: [BomItemsController],
  providers: [BomItemsService, ...BomItemsProviders],
  exports: [BomItemsService],
})
export class BomItemsModule {}
