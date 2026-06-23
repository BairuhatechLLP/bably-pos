import { ApiProperty } from '@nestjs/swagger';
import { Contactus } from '../contactus-model';

export class ContactusDto {
  @ApiProperty() readonly id: number;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly email: string;
  @ApiProperty() readonly phone: string;
  @ApiProperty() readonly message: string;
  @ApiProperty() readonly ContactOption: string;
  @ApiProperty() readonly timeZone: string;
  @ApiProperty() readonly sdate: string;


  @ApiProperty()
  readonly createdat: Date;

  constructor(val: Contactus) {
    this.id = val.id;
    this.name = val.name;
    this.email = val.email;
    this.phone = val.phone;
    this.message = val.message;
    this.ContactOption = val.ContactOption;
    this.timeZone = val.timeZone;
    this.sdate = val.sdate;

  }
}
