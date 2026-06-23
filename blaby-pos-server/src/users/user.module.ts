import { Module } from "@nestjs/common";
import { UsersController } from "./user.controller";
import { usersProviders } from "./user.providers";
import { DatabaseModule } from "../database/database.module";
import { UserService } from "./user.services";
import { JwtStrategy } from "./auth/jwt-strategy";
import { CompanyMasterModule } from "../company_master/company_master_module";
import { AccountMasterModule } from "../account_master/account_master_module";
import { MailModule } from "../mail/mail_module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { BillingCounterModule } from "../billing_counter/billing_counter_module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [
    DatabaseModule,
    CompanyMasterModule,
    AccountMasterModule,
    MailModule,
    ContactMasterModule,
    BillingCounterModule,
    SubscriptionsModule
  ],
  controllers: [UsersController],
  providers: [UserService, ...usersProviders, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
