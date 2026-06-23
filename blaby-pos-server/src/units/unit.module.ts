import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.services';
import { unitProvider } from './unit.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [UnitController],
  providers: [UnitService, ...unitProvider],
  exports: [UnitService],
})
export class UnitModule {}
