import { ApiProperty } from '@nestjs/swagger';
import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
  } from 'sequelize-typescript';
  
  @Table({
    tableName: 'proposal',
  })
  export class Proposal extends Model<Proposal> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.STRING(150))
    logo: string;
    @Column(DataType.STRING(150))
    from_company_name: string;
    @Column(DataType.DATE)
    proposal_date: Date;
    @Column(DataType.STRING(150))
    from_email: string;
    @Column(DataType.STRING(11))
    from_mobile: string;
    @Column(DataType.STRING(150))
    from_website: string;
    @Column(DataType.STRING(150))
    from_address: string;

    @Column(DataType.STRING(150))
    to_company_name: string;
    @Column(DataType.STRING(150))
    to_website: string;
    @Column(DataType.STRING(11))
    to_email: string;
    @Column(DataType.STRING(150))
    to_mobile: string;
    @Column(DataType.STRING(150))
    to_address: string;

    @Column(DataType.STRING())
    about__from_company: string;
    @Column(DataType.STRING(150))
    proposal_title: string;
    @Column(DataType.STRING(11))
    proposal_subtitle: string;
    @Column(DataType.STRING())
    proposal_details: string;

    @Column(DataType.JSON())
    billing:JSON ;

    @Column(DataType.STRING())
    proposal_terms: string;
    @Column(DataType.STRING())
    conclusion: string;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.STRING(150))
    template: string;
    @Column(DataType.STRING(150))
    primary_color: string;
    @Column(DataType.STRING(150))
    secondary_color: string;
   
    @Column(DataType.STRING(200))
    about_from_company_tag: string;

    @Column(DataType.JSON())
    project_plan: JSON;

    @Column(DataType.TEXT)
    about_from_services: string;

    @Column(DataType.TEXT)
    about_from_technologies: string;

    @Column(DataType.BIGINT)
    createdBy: number;

    @Column(DataType.BIGINT)
    companyid: number;
  
    @CreatedAt
    @Column({ field: 'createdat' })
    createdat: Date;
    @UpdatedAt
    @Column({ field: 'updatedat' })
    updatedat: Date;
    
   @Column(DataType.BOOLEAN) is_deleted: boolean;
  }
  