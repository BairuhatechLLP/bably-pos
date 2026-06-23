import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateUnit {
  @ApiProperty() readonly unit: string;
  @ApiProperty()  readonly formalName: string;
  @ApiProperty()
  @IsInt({ message: 'Decimal value must be an integer' })
  @Min(0, { message: 'decimalValues must be zero or a positive integer' })
   readonly decimalValues: number;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly companyid: number;
}
