import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ImgcompressController } from './image_compress.controller';
import { ImgcompressService } from './image_compress.service';
@Module({
  imports: [DatabaseModule],
  controllers: [ImgcompressController],
  providers: [ImgcompressService],
  exports: [ImgcompressService],
})
export class ImgcompressModule {}