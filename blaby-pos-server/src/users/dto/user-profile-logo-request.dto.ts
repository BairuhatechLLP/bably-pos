import { ApiProperty } from '@nestjs/swagger';

export class UserProfileLogoRequestDto {
    @ApiProperty()
    readonly adminid: number;

    @ApiProperty()
    readonly file: any;
}
