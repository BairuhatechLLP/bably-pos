import { Global, Module, forwardRef } from "@nestjs/common";
import { DataSyncService } from "./datasync.services";
import { DatabaseModule } from "../database/database.module";
import { DataSyncController } from "./dataSync.controller";
import { LocationModule } from "../locations/location.module";
import { EmployeeCategoryModule } from "../payroll_employeeCategory/employeeCategoryModule";
import { TaxModule } from "../tax_master/tax_master_module";
import { ProductCategoryModule } from "../product_category/product_category_module";
import { UnitModule } from "../units/unit.module";
import { CompanyMasterModule } from "../company_master/company_master_module";
import { UserModule } from "../users/user.module";
import { PayRollEmployeesModule } from "../payroll_employees/employeeModule";
import { AccountMasterModule } from "../account_master/account_master_module";
import { ProductMastersModule } from "../product_master/product_master_module";
import { ContactMasterModule } from "../contactMaster/contactMasterModule";
import { LedgerDetailsModule } from "../ledger_details/ledger_details_module";
import { dataTransferLogProviders } from "./dataSync.provider";
import { DataSynclogService } from "./datatransferlog.service";

@Global()
@Module({
  imports: [
    DatabaseModule,
    LocationModule,
    EmployeeCategoryModule,
    TaxModule,
    ProductCategoryModule,
    UnitModule,
    CompanyMasterModule,
    UserModule,
    PayRollEmployeesModule,
    AccountMasterModule,
    ProductMastersModule,
    ContactMasterModule,
    LedgerDetailsModule,
  ],
  providers: [DataSyncService, DataSynclogService, ...dataTransferLogProviders],
  controllers: [DataSyncController],
  exports: [DataSyncService],
})
export class DataSyncModule {}
