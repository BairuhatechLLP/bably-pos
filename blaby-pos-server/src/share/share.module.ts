import { DatabaseModule } from "../database/database.module";
import { Module, forwardRef } from "@nestjs/common";
import { ShareService } from "./share.service";
import { ShareController } from "./share.controller";
import { SalesInvoicesModule } from "../sale_invoice/sale_invoice_module";
import { PurchaseInvoiceModule } from "../purchase_invoice/purchase_invoice_module";
import { UserModule } from "../users/user.module";
import { CompanyMasterModule } from "../company_master/company_master_module";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => SalesInvoicesModule),
    PurchaseInvoiceModule,
    forwardRef(() => UserModule),
    forwardRef(()=>CompanyMasterModule)
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
