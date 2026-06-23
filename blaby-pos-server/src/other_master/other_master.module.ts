import { DatabaseModule } from "../database/database.module";
import { Module } from "@nestjs/common";
import { OtherMasterService } from "./other_master.service";
import { OtherMasterController } from "./other_master.controller";
import { OtherMasterProvider } from "./other_master.provider";

@Module({
  imports: [DatabaseModule],
  controllers: [OtherMasterController],
  providers: [OtherMasterService, ...OtherMasterProvider],
  exports: [OtherMasterService],
})
export class OtherMasterModule {}
