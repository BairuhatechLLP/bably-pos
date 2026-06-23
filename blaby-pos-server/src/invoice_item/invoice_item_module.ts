import { DatabaseModule } from "../database/database.module";
import { Module } from "@nestjs/common";
import { InvoiceItemsService } from "./invoice_item_service";
import { InvoiceItemProviders } from "./invoice_items_providers";

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [InvoiceItemsService, ...InvoiceItemProviders],
  exports: [InvoiceItemsService],
})
export class InvoiceItemsModule {}
