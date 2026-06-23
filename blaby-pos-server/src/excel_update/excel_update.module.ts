
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExcelUpdateController } from './excel_update.controller';
import { ExcelUpdateService } from './excel_update.service';
import { excelUpdateProviders } from './excel_update.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ExcelUpdateController],
  providers: [ExcelUpdateService, ...excelUpdateProviders],
  exports: [ExcelUpdateService],
})
export class ExcelUpdateModule {}