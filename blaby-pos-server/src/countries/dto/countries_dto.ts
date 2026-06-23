import { ApiProperty } from "@nestjs/swagger"; 
import { Countries } from "../countries_model";

export class CountriesDto {
    @ApiProperty()
    readonly id: number

    @ApiProperty() readonly code: string
    @ApiProperty() readonly name: string
    @ApiProperty() readonly phoneCode: string
    @ApiProperty() readonly currencycode: any
    @ApiProperty() readonly currency: any
    @ApiProperty() readonly symbol: any
    @ApiProperty() readonly taxtype: string
    @ApiProperty() readonly maincurrency: any
    @ApiProperty() readonly subcurrency: any

    @ApiProperty()
    readonly createdat: Date

    @ApiProperty()
    readonly updateat: Date

    constructor(tmp: Countries) {
        this.id = tmp.id;
        this.name = tmp.name;
        this.code = tmp.code;
        this.phoneCode = tmp.phoneCode;
        this.currencycode = tmp.currencycode;
        this.symbol = tmp.symbol;
        this.currency = tmp.currency;
        this.taxtype = tmp.taxtype;
        this.createdat = tmp.createdat;
        this.updateat = tmp.updatedat;
        this.maincurrency = tmp.maincurrency;
        this.subcurrency = tmp.subcurrency;
    }

}