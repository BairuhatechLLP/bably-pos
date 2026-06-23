import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { KitchenDisplayService } from "./kitchen_display.service";
import { KitchenDisplayProviders } from "./kitchen_display.provider";
import { KitchenDisplayController } from "./kitchen_display.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [KitchenDisplayController],
  providers: [KitchenDisplayService, ...KitchenDisplayProviders],
  exports: [KitchenDisplayService],
})
export class KitchenDisplayModule {}