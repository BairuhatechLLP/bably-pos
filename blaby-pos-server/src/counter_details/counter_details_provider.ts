import { CounterDetails } from "./counter_details_entity";

export const CounterDetailsProvider = [
    {
        provide: 'CounterDetailsRepository',
        useValue: CounterDetails
    }
]