import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { StripeLogController } from "./stripe_log.controller";
import { StripeLogService } from "./stripe_log.service";
import { stripeLog } from "./stipe_log.provider";
import { StaffTransactionsModule } from "../staff_transactions/staff_transactions_module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { UserModule } from "../users/user.module";
import { AffiliationsModule } from "../affiliations/affiliations-module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => StaffTransactionsModule),
    SubscriptionsModule,
    AffiliationsModule,
    forwardRef(() => UserModule),
  ],
  controllers: [StripeLogController],
  providers: [StripeLogService, ...stripeLog],
  exports: [StripeLogService],
})
export class StripeLogModule {}
