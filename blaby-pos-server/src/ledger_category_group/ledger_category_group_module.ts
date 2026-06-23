import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { LedgerCategoryGroupController } from './ledger_category_group_controller';
import { LedgerCategoryGroupService } from './ledger_category_group_service';
import { LedgerCategory_provider } from './ledger_category_group_provider';

@Module({
    imports: [DatabaseModule],
    controllers: [LedgerCategoryGroupController],
    providers: [LedgerCategoryGroupService, ...LedgerCategory_provider],
    exports: [],
})
export class LedgerCategoryGroupModule {}