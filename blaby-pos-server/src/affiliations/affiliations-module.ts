import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AffiliationsService } from "./affiliations-service";
import { affiliationsProviders } from "./afiliations-provider";
import { AffiliationsController } from "./affiliations-controller";
import { MailModule } from "../mail/mail_module";

@Module({
  imports: [DatabaseModule,MailModule],
  controllers: [AffiliationsController],
  providers: [AffiliationsService, ...affiliationsProviders],
  exports: [AffiliationsService],
})
export class AffiliationsModule {}
