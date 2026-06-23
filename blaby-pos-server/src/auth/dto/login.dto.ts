import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class login_Email {
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly password: string;
}

export class login_phone {
  @ApiProperty()
  readonly code: string;
  @ApiProperty()
  readonly phone: string;
}

export class login_Gmail {
  @ApiProperty()
  readonly first_name: string;
  @ApiProperty()
  readonly name: string;
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly image: string;
  @ApiProperty()
  readonly type: string;
}
export class login_google {
  @IsNotEmpty({ message: "UnAuthorized Access" })
  @ApiProperty()
  readonly idToken: string;
}
