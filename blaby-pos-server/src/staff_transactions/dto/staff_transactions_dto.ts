import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";
import { StaffTransactions } from "../staff_transactions_entity";

export class StaffTransactionsDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  adminid: number;

  @ApiProperty()
  @IsNumber()
  companyid: number;

  @ApiProperty()
  @IsString()
  ledger: string;

  @ApiProperty()
  @IsString()
  ledgercategory: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  usertype: string;

  @ApiProperty()
  @IsNumber()
  paid_amount: number;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  outstanding: number;

  @ApiProperty()
  @IsNumber()
  saleid: number;

  @ApiProperty()
  @IsNumber()
  purchaseid: number;

  @ApiProperty()
  @IsString()
  journalid: string;

  @ApiProperty()
  @IsString()
  invoiceno: string;

  @ApiProperty()
  @IsString()
  saletype: string;

  @ApiProperty()
  @IsString()
  paymethod: string;

  @ApiProperty()
  @IsNumber()
  staffid: number;

  @ApiProperty()
  @IsNumber()
  counterid: number;

  @ApiProperty()
  @IsNumber()
  shiftid: number;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNumber()
  paid_status: number;

  @ApiProperty()
  @IsString()
  sdate: Date;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsString()
  updated_at: Date;

  constructor(staffTransaction: StaffTransactions) {
    this.id = staffTransaction.id;
    this.adminid = staffTransaction.adminid;
    this.companyid = staffTransaction.companyid;
    this.ledger = staffTransaction.ledger;
    this.ledgercategory = staffTransaction.ledgercategory;
    this.type = staffTransaction.type;
    this.usertype = staffTransaction.usertype;
    this.paid_amount = staffTransaction.paid_amount;
    this.total = staffTransaction.total;
    this.saleid = staffTransaction.saleid;
    this.counterid = staffTransaction.counterid;
    this.shiftid = staffTransaction.shiftid;
    this.purchaseid = staffTransaction.purchaseid;
    this.journalid = staffTransaction.journalid;
    this.invoiceno = staffTransaction.invoiceno;
    this.saletype = staffTransaction.saletype;
    this.paymethod = staffTransaction.paymethod;
    this.staffid = staffTransaction.staffid;
    this.status = staffTransaction.status;
    this.paid_status = staffTransaction.paid_status;
    this.created_at = staffTransaction.created_at;
    this.updated_at = staffTransaction.updated_at;
  }
}
