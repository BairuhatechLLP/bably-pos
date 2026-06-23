import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { StockTransferService } from "./stock_transfer.service";
import { stockTransfer } from "./stock_transfer.provider";
import { StockTransferController } from "./stock_transfer.controller";
import { ProductLocationMasterModule } from "../product_location_master/product_location.module";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { LocationModule } from "../locations/location.module";
import { UserSettingsModule } from "../user_settings/user_settings_module";
import { OtherMasterModule } from "../other_master/other_master.module";

@Module({
  imports: [
    DatabaseModule,
    ProductLocationMasterModule,
    LedgerDetailsModule,
    LocationModule,
    UserSettingsModule,
    OtherMasterModule
  ],
  controllers: [StockTransferController],
  providers: [StockTransferService, ...stockTransfer],
  exports: [StockTransferService],
})
export class StockTransferModule {}
