import { Module, forwardRef } from "@nestjs/common";
import { AccountMasterModule } from "../account_master/account_master_module";
import { DatabaseModule } from "../database/database.module";
import { LocationModule } from "../locations/location.module";
import { UserSettingsModule } from "../user_settings/user_settings_module";
import { UserModule } from "../users/user.module";
import { CompanyMasterController } from "./company_master_controller";
import { CompanyMasterProviders } from "./company_master_providers";
import { CompanyMasterService } from "./company_master_service";

@Module({
  imports: [
    DatabaseModule,
    AccountMasterModule,
    forwardRef(() => UserModule),
    UserSettingsModule,
    LocationModule,
  ],
  controllers: [CompanyMasterController],
  providers: [CompanyMasterService, ...CompanyMasterProviders],
  exports: [CompanyMasterService],
})
export class CompanyMasterModule {}
