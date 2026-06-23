import { Module } from '@nestjs/common';

import { TaxController } from './tax_master_controller';
import { tax } from './tax_master_providers';
import { DatabaseModule } from '../database/database.module';
import { TaxService } from './tax_master_service';
import { JwtStrategy } from '../users/auth/jwt-strategy';

@Module({
  imports: [DatabaseModule],
  controllers: [TaxController],
  providers: [TaxService, ...tax],
  exports: [TaxService],
})
export class TaxModule {}
