import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HsnCodeController } from './hsn_code.controller';
import { HsnCodeService } from './hsn_code.service';
import { hsnCode } from './hsn_code.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [HsnCodeController],
  providers: [HsnCodeService, ...hsnCode],
  exports: [],
})
export class HsnCodeModule {}
