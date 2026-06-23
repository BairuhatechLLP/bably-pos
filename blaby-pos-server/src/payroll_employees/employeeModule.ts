import { Module } from '@nestjs/common';
import { EmployeesController } from './employee_controller';
import { EmployeesService } from './employeeServices';
import { employeesProvider } from './employeeProvider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, ...employeesProvider],
  exports: [EmployeesService],
})
export class PayRollEmployeesModule {}
