import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProposalDto {

  @IsOptional() @ApiProperty() @IsString() readonly logo: string;
  @IsOptional() @ApiProperty() @IsString() readonly from_company_name: string;
  @IsOptional() @ApiProperty()  readonly proposal_date: Date;
  @IsOptional() @ApiProperty() @IsString() readonly from_email: string;
  @IsOptional() @ApiProperty() @IsString() readonly from_mobile: string;
  @IsOptional() @ApiProperty() @IsString() readonly from_website: string;
  @IsOptional() @ApiProperty() @IsString() readonly from_address: string;

  @IsOptional() @ApiProperty() @IsString() readonly to_company_name: string;
  @IsOptional() @ApiProperty() @IsString() readonly to_website: string;
  @IsOptional() @ApiProperty() @IsString() readonly to_email: string;
  @IsOptional() @ApiProperty() @IsString() readonly to_mobile: string;
  @IsOptional() @ApiProperty() @IsString() readonly to_address: string;

  @IsOptional() @ApiProperty() @IsString() readonly about__from_company: string;
  @IsOptional() @ApiProperty() @IsString() readonly proposal_title: string;
  @IsOptional() @ApiProperty() @IsString() readonly proposal_subtitle: string;
  @IsOptional() @ApiProperty() @IsString() readonly proposal_details: string;
  @IsOptional() @ApiProperty() @IsString() readonly proposal_terms: string;
  @IsOptional() @ApiProperty() @IsString() readonly conclusion: string;

  @IsOptional() @ApiProperty() @IsString() readonly primary_color: string;
  @IsOptional() @ApiProperty() @IsString() readonly secondary_color: string;
  @IsOptional() @ApiProperty() @IsString() readonly template: string;
  @IsOptional() @ApiProperty() readonly project_plan: JSON;
  @IsOptional() @ApiProperty() @IsString() readonly about_from_company_tag: string;
  @IsOptional() @ApiProperty() @IsString() readonly about_from_services: string;
  @IsOptional() @ApiProperty() @IsString() readonly about_from_technologies: string;
  @IsOptional() @ApiProperty() readonly createdBy: number;
  
  @IsOptional() @ApiProperty() readonly billing: JSON;

  @IsOptional() @ApiProperty() @IsNumber() readonly adminid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly companyid: number;

}
