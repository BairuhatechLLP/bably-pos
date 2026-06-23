import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
 
export class UpdateCountriesDto {

    @IsOptional() @ApiProperty() @IsString() readonly name: string
    @IsOptional() @ApiProperty() @IsString() readonly code: string
   
}