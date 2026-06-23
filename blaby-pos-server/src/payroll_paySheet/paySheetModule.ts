import { Module } from '@nestjs/common';
import { PaySheetController } from './paySheet_controller';
import { PaySheetService } from './paySheetServices';
import { paySheetProvider } from './paySheetProvider';
import { DatabaseModule } from '../database/database.module';
import { PaySheetItemsModule } from '../payroll_paySheetItems/paysheetItemsModule';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { AccountMasterModule } from '../account_master/account_master_module';

@Module({
  imports: [DatabaseModule, PaySheetItemsModule,LedgerDetailsModule,AccountMasterModule],
  controllers: [PaySheetController],
  providers: [PaySheetService, ...paySheetProvider],
  exports: [PaySheetService],
})
export class PayRollPaySheetModule {}
