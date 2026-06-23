import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";
import { PlanProvider } from "./plan.provider";
import { PlanRepository } from "./plan.repository";
  
@Module({
  imports: [DatabaseModule],
  controllers: [PlanController],
  providers: [PlanService, ...PlanProvider, PlanRepository],
  exports: [PlanService],
})
export class PlanModule {}