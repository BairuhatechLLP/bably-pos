import { ApiProperty } from "@nestjs/swagger"; 

export class DashboardCustomDataReqDto {
   
    @ApiProperty() readonly ldate: Date
    @ApiProperty() readonly sdate: Date
    @ApiProperty() readonly type: string
    @ApiProperty() readonly adminid: number

}