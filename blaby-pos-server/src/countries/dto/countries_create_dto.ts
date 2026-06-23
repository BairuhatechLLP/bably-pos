import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean,  IsDate,  IsNumber,   IsString } from "class-validator";

export class CreateCountriesDto {
    @ApiProperty() @IsString() readonly name: string
    @ApiProperty() @IsString() readonly code: string
}