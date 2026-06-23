import { DatabaseModule } from "../database/database.module";
import { Module, forwardRef } from "@nestjs/common";
import { JournalController } from "./journal_controller";
import { JournalService } from "./journal_service";
import { journalProvider } from "./journal_provider";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { AccountMasterModule } from "../account_master/account_master_module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";

@Module({
  imports: [
    DatabaseModule,
    LedgerDetailsModule,
    forwardRef(() => AccountMasterModule),
    ContactMasterModule,
  ],
  controllers: [JournalController],
  providers: [JournalService, ...journalProvider],
  exports: [JournalService],
})
export class JournalModule {}
