import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { BillingCounter } from "./billing_counter_entity";

export const BillingCounterProvider = [
  {
    provide: "BillingCounterRepository",
    useValue: BillingCounter,
  },
  { provide: "SubscriptionsRepository", useValue: Subscriptions },
];
