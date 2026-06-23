import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProposalController } from './proposal_controller';
import { ProposalService } from './proposal_service';
import { ProposalProvider } from './proposal_provider';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ProposalController],
  providers: [ProposalService, ...ProposalProvider],
  exports: [ProposalService],
})
export class ProposalModule {}
