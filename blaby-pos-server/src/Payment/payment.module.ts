import { Module, forwardRef } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { MailModule } from "../mail/mail_module";
import { ShareModule } from "../share/share.module";
import { CompanyMasterModule } from "../company_master/company_master_module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { UserModule } from "../users/user.module";

@Module({
  imports: [
    MailModule,
    forwardRef(() => ShareModule),
    forwardRef(() => CompanyMasterModule),
    SubscriptionsModule,
    forwardRef(() => UserModule)
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
