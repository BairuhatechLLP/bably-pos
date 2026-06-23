import { ApiProperty } from '@nestjs/swagger';
import { Proposal } from '../proposal_model';

export class ProposalDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly logo: string;

  @ApiProperty() readonly from_company_name: string;
  @ApiProperty() readonly proposal_date: Date;
  @ApiProperty() readonly from_email: string;
  @ApiProperty() readonly from_mobile: string;
  @ApiProperty() readonly from_website: string;
  @ApiProperty() readonly from_address: string;

  @ApiProperty() readonly to_company_name: string;
  @ApiProperty() readonly to_website: string;
  @ApiProperty() readonly to_email: string;
  @ApiProperty() readonly to_mobile: string;
  @ApiProperty() readonly to_address: string;

  @ApiProperty() readonly about__from_company: string;
  @ApiProperty() readonly proposal_title: string;
  @ApiProperty() readonly proposal_subtitle: string;
  @ApiProperty() readonly proposal_details: string;

  @ApiProperty()
  readonly billing: JSON;
  
  @ApiProperty() readonly proposal_terms: string;
  @ApiProperty() readonly conclusion: string;

  @ApiProperty() readonly adminid: number;

  @ApiProperty() readonly template: string;
  @ApiProperty() readonly primary_color: string;
  @ApiProperty() readonly secondary_color: string;
  @ApiProperty() readonly about_from_company_tag: string;
  @ApiProperty() readonly project_plan: JSON;
  @ApiProperty() readonly about_from_services: string;
  @ApiProperty() readonly about_from_technologies: string;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;


  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updateat: Date;

  constructor(tmp: Proposal) {
    this.id = tmp.id;
    this.from_company_name = tmp.from_company_name;
    this.proposal_date = tmp.proposal_date;
    this.from_email = tmp.from_email;
    this.from_mobile = tmp.from_mobile;
    this.from_website = tmp.from_website;
    this.from_address = tmp.from_address;

    this.to_company_name = tmp.to_company_name;
    this.to_website = tmp.to_website;
    this.to_email = tmp.to_email;
    this.to_mobile = tmp.to_mobile;
    this.to_address = tmp.to_address;
    this.about__from_company = tmp.about__from_company;
    
    this.proposal_title = tmp.proposal_title;
    this.proposal_subtitle = tmp.proposal_subtitle;
    this.proposal_details = tmp.proposal_details;
    this.proposal_terms = tmp.proposal_terms;
    this.conclusion = tmp.conclusion;

    this.billing = tmp.billing;
    this.template = tmp.template;

    this.adminid = tmp.adminid;
    this.createdat = tmp.createdat;
    this.updateat = tmp.updatedat;
    this.about_from_company_tag = tmp.about_from_company_tag;
    this.project_plan = tmp.project_plan;
    this.about_from_services = tmp.about_from_services;
    this.about_from_technologies = tmp.about_from_technologies;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;
  }
}
