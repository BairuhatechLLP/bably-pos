import { ProductMastersModule } from "../product_master/product_master_module";
import { DatabaseModule } from "../database/database.module";
import { forwardRef, Module } from "@nestjs/common";
import { RetailController } from "./retail.controller";
import { RetailService } from "./retail.service";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { ProductLocationMasterModule } from "../product_location_master/product_location.module";

@Module({
  imports: [
    DatabaseModule,
    ProductMastersModule,
    ContactMasterModule,
    forwardRef(() => SalesInvoicesModule),
    forwardRef(() => ProductLocationMasterModule),
  ],
  controllers: [RetailController],
  providers: [RetailService],
  exports: [],
})
export class RetailModule {}
