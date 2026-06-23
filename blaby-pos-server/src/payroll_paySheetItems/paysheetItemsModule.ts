import { Module } from '@nestjs/common';
import { PaySheetItemsController } from './paysheetItems_controller';
import { PaySheetItemsService } from './paysheetItemsServices';
import { paySheetItemProvider } from './paysheetItemsProvider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaySheetItemsController],
  providers: [PaySheetItemsService, ...paySheetItemProvider],
  exports: [PaySheetItemsService],
})
export class PaySheetItemsModule {}
