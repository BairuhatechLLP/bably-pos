import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { MerchantController } from './merchant_controller';
import { MerchantProviders } from './merchant_providers';
import { MerchantService } from './merchant_service';

@Module({
  imports: [DatabaseModule, LedgerDetailsModule],
  controllers: [MerchantController],
  providers: [MerchantService, ...MerchantProviders],
  exports: [MerchantService],
})
export class MerchantModule {}
