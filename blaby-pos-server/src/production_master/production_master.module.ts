import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { ProductionMasterController } from "./production_master.controller";
import { ProductionMasterProviders } from "./production_master.provider";
import { ProductionMasterService } from "./production_master.service";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";

@Module({
  imports: [DatabaseModule, LedgerDetailsModule],
  controllers: [ProductionMasterController],
  providers: [ProductionMasterService, ...ProductionMasterProviders],
  exports: [],
})
export class ProductionMasterModule {}
