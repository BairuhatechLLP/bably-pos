import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProposalDto {
  @ApiProperty({ example: 'company' })
  @IsString()
  readonly from_company_name: string;
  @ApiProperty({ example: 'qwertyuiop' })
  @IsString()
  readonly logo: string;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  readonly proposal_date: Date;

  @ApiProperty({ example: 'example@email.com' })
  @IsString()
  @IsOptional()
  readonly from_email: string;

  @ApiProperty({ example: '9876543210' })
  readonly from_mobile: string;

  @ApiProperty({ example: 'www.example.com' })
  @IsString()
  @IsOptional()
  readonly from_website: string;

  @ApiProperty({ example: 'qwertyu' })
  @IsString()
  @IsOptional()
  readonly from_address: string;

  @ApiProperty({ example: 'company' })
  @IsString()
  readonly to_company_name: string;

  @ApiProperty({ example: 'www.example.com' })
  @IsString()
  @IsOptional()
  readonly to_website: string;

  @ApiProperty({ example: 'example@email.com' })
  @IsString()
  @IsOptional()
  readonly to_email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  readonly to_mobile: string;

  @ApiProperty({ example: 'qwertyu' })
  @IsString()
  @IsOptional()
  readonly to_address: string;

  @ApiProperty({ example: 'qwertyu' })
  @IsString()
  @IsOptional()
  readonly about__from_company: string;

  @ApiProperty({ example: 'title' })
  @IsString()
  readonly proposal_title: string;

  @ApiProperty({ example: 'sub title' })
  @IsString()
  readonly proposal_subtitle: string;

  @ApiProperty({ example: 'qwertyuiop' })
  @IsString()
  readonly proposal_details: string;

  @ApiProperty({
    example: [{ description: 'Ecommerce', qty: 1, price: 1000, total: 1000 }],
  })
  readonly billing: JSON;

  @ApiProperty({ example: 'terms' })
  @IsString()
  readonly proposal_terms: string;

  @ApiProperty({ example: 'conclusion' })
  @IsString()
  readonly conclusion: string;

  @ApiProperty({ example: 17 }) @IsNumber() readonly adminid: number;

  @ApiProperty({ example: 'qwertyuiop' })
  @IsString()
  readonly primary_color: string;

  @ApiProperty({ example: 'template1' })
  @IsString()
  readonly template: string;

  @ApiProperty({ example: 'qwertyuiop' })
  @IsString()
  readonly secondary_color: string;

  @ApiProperty({})
  @IsString()
  readonly about_from_company_tag: string;

  @ApiProperty({})
  @IsString()
  readonly about_from_services: string;

  @ApiProperty({})
  @IsString()
  readonly about_from_technologies: string;

  @ApiProperty({})
  readonly project_plan: JSON;

  @ApiProperty({})
  @IsNumber()
  readonly createdBy: number;

  @ApiProperty({})
  @IsNumber()
  readonly companyid: number;
}
