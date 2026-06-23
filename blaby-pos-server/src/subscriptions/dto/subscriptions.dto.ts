import { ApiProperty } from "@nestjs/swagger";
import { Subscriptions } from "../subscriptions.entity";
  
export class SubscriptionsDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  readonly company: number;

  @ApiProperty()
  readonly counter: number;

  @ApiProperty()
  readonly retailXpressWithTaxgo: boolean;

  @ApiProperty()
  readonly soleTrader: boolean;

  @ApiProperty()
  readonly subscriptionExpiry: Date;

  constructor(subscriptions: Subscriptions) {
    this.id = subscriptions.id;
    this.userId = subscriptions.userId;
    this.company = subscriptions.company;
    this.counter = subscriptions.counter;
    this.retailXpressWithTaxgo = subscriptions.retailXpressWithTaxgo;
    this.soleTrader = subscriptions.soleTrader;
    this.subscriptionExpiry = subscriptions.subscriptionExpiry;
  }
}