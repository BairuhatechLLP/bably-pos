import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { CounterDetails } from "../counter_details_entity";

export class CounterDetailsDto {
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
    counter_id: number;

    @ApiProperty()
    @IsNumber()
    balance: number;

    @ApiProperty()
    @IsNumber()
    staffid: number;

    @ApiProperty()
    @IsString()
    shift_type: string;

    readonly sdate: Date;
    readonly open_denomination: object;
    readonly close_denomination: object;
    constructor(counterDetails: CounterDetails) {
        this.id = counterDetails.id;
        this.shift_type = counterDetails.shift_type;
        this.adminid = counterDetails.adminid;
        this.companyid = counterDetails.companyid;
        this.balance = counterDetails.balance;
        this.staffid = counterDetails.staffid;
        this.counter_id = counterDetails.counter_id;
        this.open_denomination = counterDetails.open_denomination;
        this.close_denomination = counterDetails.close_denomination;
        this.sdate = counterDetails.sdate;
    }
}