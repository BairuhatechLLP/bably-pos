import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateDiningTableDto {
    @IsOptional()
    @ApiPropertyOptional() 
    readonly table_number: string;

    @IsOptional()
    @ApiPropertyOptional() 
    readonly capacity: number;

    @IsOptional()
    @ApiPropertyOptional() 
    readonly status: string;

    @IsOptional()
    @ApiPropertyOptional() 
    readonly section: string;

    @IsOptional()
    @ApiPropertyOptional() 
    readonly admin_id: number;

    @IsOptional()
    @ApiPropertyOptional() 
    readonly company_id: number;
}
