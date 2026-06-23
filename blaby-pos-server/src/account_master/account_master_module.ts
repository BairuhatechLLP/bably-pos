import { DatabaseModule } from '../database/database.module';
import { Module, forwardRef } from '@nestjs/common';
import { AccountMasterController } from './account_master_controller';
import { AccountMasterService } from './account_master_service';
import { AccountMasterProviders } from './account_master_provider';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { ProductMastersModule } from '../product_master/product_master_module';
import { ContactMasterModule } from '../contactMaster/contactMasterModule';
import { ReportModule } from '../report/report.module';
import { CompanyMasterModule } from '../company_master/company_master_module';
import { OtherMasterModule } from '../other_master/other_master.module';

@Module({
  imports: [DatabaseModule, LedgerDetailsModule, ProductMastersModule,ContactMasterModule,ReportModule,forwardRef(()=>CompanyMasterModule) ,OtherMasterModule],
  controllers: [AccountMasterController],
  providers: [AccountMasterService, ...AccountMasterProviders],
  exports: [AccountMasterService],
})
export class AccountMasterModule {}
