import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { blog } from './blog.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogController],
  providers: [BlogService, ...blog],
  exports: [],
})
export class BlogModule {}
