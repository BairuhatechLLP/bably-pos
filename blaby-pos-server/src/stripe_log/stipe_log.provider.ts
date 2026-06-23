import { StripeLog } from "./stripe_log.entity";

export const stripeLog = [
  { provide: 'StripeLogRepository', useValue: StripeLog },
];
