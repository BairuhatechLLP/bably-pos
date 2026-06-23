import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DiningTableController } from "./dining_table.controller";
import { DiningTableService } from "./dining_table.service";
import { DiningTableProvider } from "./dining_table.provider";

@Module({
  imports: [DatabaseModule],
  controllers: [DiningTableController],
  providers: [DiningTableService, ...DiningTableProvider],
  exports: [DiningTableService],
})
export class DiningTableModule {}
