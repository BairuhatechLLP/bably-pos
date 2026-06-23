import { ApiProperty } from "@nestjs/swagger";
import { Plan } from "../plan.entity";
  
export class PlanDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly company: number;

  @ApiProperty()
  readonly counter: number;

  @ApiProperty()
  readonly retailXpressWithTaxgo: number;

  @ApiProperty()
  readonly soleTrader: number;

  @ApiProperty()
  readonly period: number;

  @ApiProperty()
  readonly currencyCode: string;

  constructor(plan: Plan) {
    this.id = plan.id;
    this.name = plan.name;
    this.company = plan.company;
    this.counter = plan.counter;
    this.retailXpressWithTaxgo = plan.retailXpressWithTaxgo;
    this.soleTrader = plan.soleTrader;
    this.period = plan.period;
    this.currencyCode = plan.currencyCode;
  }
}