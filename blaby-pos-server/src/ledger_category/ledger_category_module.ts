import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { LedgerCategoryController } from './ledger_category_controller';
import { LedgerCategoryService } from './ledger_category_service';
import { LedgerCategoryProviders } from './ledger_category_provider';

@Module({
    imports: [DatabaseModule],
    controllers: [LedgerCategoryController],
    providers: [LedgerCategoryService, ...LedgerCategoryProviders],
    exports: [LedgerCategoryService],
})
export class LedgerCategoryModule {}
