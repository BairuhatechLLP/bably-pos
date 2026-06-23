import { DatabaseModule } from "../database/database.module";
import { Module, forwardRef } from "@nestjs/common";
import { ProductLocationMasterController } from "./product_location.controller";
import { ProductLocationMasterService } from "./product_location.service";
import { ProductLocationMasterProviders } from "./product_location.provider";
import { ProductMastersModule } from "../product_master/product_master_module";

@Module({
  imports: [DatabaseModule, forwardRef(() => ProductMastersModule)],
  controllers: [ProductLocationMasterController],
  providers: [ProductLocationMasterService, ...ProductLocationMasterProviders],
  exports: [ProductLocationMasterService],
})
export class ProductLocationMasterModule {}
