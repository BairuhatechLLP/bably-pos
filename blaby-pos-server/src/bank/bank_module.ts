import { Module, forwardRef } from '@nestjs/common';
import { AccountMasterModule } from '../account_master/account_master_module';
import { ContactMasterModule } from '../contactMaster/contactMasterModule';
import { DatabaseModule } from '../database/database.module';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { BankController } from './bank_controller';
import { BankService } from './bank_service';
import { PayRollEmployeesModule } from '../payroll_employees/employeeModule';
import { OtherMasterModule } from '../other_master/other_master.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AccountMasterModule),
    forwardRef(() => LedgerDetailsModule),
    forwardRef(() => ContactMasterModule),
    PayRollEmployeesModule,
    OtherMasterModule
  ],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
