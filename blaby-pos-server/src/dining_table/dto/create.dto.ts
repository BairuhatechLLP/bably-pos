import { ApiProperty } from '@nestjs/swagger';
import { TableSection, TableStatus } from '../dining_table.entity';

export class CreateDiningTableDto {
  @ApiProperty() 
  readonly table_number: string;
  @ApiProperty() 
  readonly capacity: number;
  @ApiProperty() 
  readonly status: TableStatus;
  @ApiProperty() 
  readonly section: TableSection;
  @ApiProperty() 
  readonly admin_id: number;
  @ApiProperty() 
  readonly company_id: number;
}
