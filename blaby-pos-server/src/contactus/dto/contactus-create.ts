import { ApiProperty } from '@nestjs/swagger';

export class CreateContactusDto {
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly email: string;
  @ApiProperty() readonly phone: string;
  @ApiProperty() readonly message: string;
  @ApiProperty() readonly ContactOption: string;
  @ApiProperty() readonly timeZone: string;
  @ApiProperty() readonly sdate: string;

}
