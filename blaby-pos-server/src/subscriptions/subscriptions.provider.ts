import { Subscriptions } from "./subscriptions.entity";

export const SubscriptionsProvider = [
  { provide: "SubscriptionsRepository", useValue: Subscriptions },
];
