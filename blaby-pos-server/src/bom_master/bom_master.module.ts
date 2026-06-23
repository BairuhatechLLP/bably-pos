import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { BomMasterService } from "./bom_master.service";
import { BomMasterProviders } from "./bom_master.provider";
import { BomMasterController } from "./bom_master.controller";
import { BomItemsModule } from "../bom_items/bom_items.module";

@Module({
  imports: [DatabaseModule,BomItemsModule],
  controllers: [BomMasterController],
  providers: [BomMasterService, ...BomMasterProviders],
  exports: [],
})
export class BomMasterModule {}
