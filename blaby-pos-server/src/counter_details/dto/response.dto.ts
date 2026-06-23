import { ApiProperty } from "@nestjs/swagger";
import { CounterDetails } from "../counter_details_entity";

export class CounterDetailsOpenShiftResponse extends CounterDetails {
  @ApiProperty()
  counter: any;

  constructor(counterDetails: CounterDetails, counter?: any) {
    super(counterDetails);
    this.counter = counter;
  }
}
