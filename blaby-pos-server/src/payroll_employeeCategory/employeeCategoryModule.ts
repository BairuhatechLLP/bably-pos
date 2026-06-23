import { Module } from '@nestjs/common';
import { EmployeeCategoryController } from './employeeCategory_controller';
import { EmployeeCategoryService } from './employeeCategoryServices';
import { employeeCategoryProvider } from './employeeCategoryProvider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeCategoryController],
  providers: [EmployeeCategoryService, ...employeeCategoryProvider],
  exports: [EmployeeCategoryService],
})
export class EmployeeCategoryModule {}
