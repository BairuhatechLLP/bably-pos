import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { BillingCounter } from "../billing_counter_entity";

export class BillingCounterDto {
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
    @IsNumber()
    location: number;;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    balance: number;

    readonly denomination: object;
    readonly shiftlist: object;
    readonly sdate: Date;

    constructor(billingCounter: BillingCounter) {
        this.id = billingCounter.id;
        this.adminid = billingCounter.adminid;
        this.companyid = billingCounter.companyid;
        this.location = billingCounter.location;
        this.name = billingCounter.name;
        this.balance = billingCounter.balance;
        this.denomination = billingCounter.denomination;
        this.shiftlist = billingCounter.shiftlist;
        this.sdate = billingCounter.sdate;
    }
}