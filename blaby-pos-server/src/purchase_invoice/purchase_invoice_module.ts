import { DatabaseModule } from '../database/database.module';
import { Module, forwardRef } from '@nestjs/common';
import { PurchaseInvoiceController } from './purchase_invoice_controller';
import { PurchaseInvoiceService } from './purchase_invoice_service';
import { PurchaseInvoiceProvider } from './purchase_invoice_provider';
import { LedgerDetailsModule } from '../ledger_details/ledger_details_module';
import { ProductMastersModule } from '../product_master/product_master_module';
import { AccountMasterModule } from '../account_master/account_master_module';
import { UserSettingsModule } from '../user_settings/user_settings_module';
import { InvoiceItemsModule } from '../invoice_item/invoice_item_module';
import { PurchaseInvoiceHelperService } from './purchase_invoice_helper_service';
import { BankModule } from '../bank/bank_module';
import { ContactMasterModule } from '../contactMaster/contactMasterModule';
import { StaffTransactionsModule } from '../staff_transactions/staff_transactions_module';
import { LocationModule } from '../locations/location.module';
import { TaxModule } from '../tax_master/tax_master_module';
import { UnitModule } from '../units/unit.module';
import { ProductCategoryModule } from '../product_category/product_category_module';
import { JwtModule } from '@nestjs/jwt';
import { OtherMasterModule } from '../other_master/other_master.module';
import { ProductLocationMasterModule } from '../product_location_master/product_location.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => LedgerDetailsModule),
    forwardRef(() => ProductMastersModule),
    forwardRef(() => AccountMasterModule),
    UserSettingsModule,
    InvoiceItemsModule,
    BankModule,
    forwardRef(() => ContactMasterModule),
    StaffTransactionsModule,
    LocationModule,
    TaxModule,
    UnitModule,
    ProductCategoryModule,
    JwtModule,
    OtherMasterModule,
    ProductLocationMasterModule
  ],
  controllers: [PurchaseInvoiceController],
  providers: [
    PurchaseInvoiceService,
    PurchaseInvoiceHelperService,
    ...PurchaseInvoiceProvider,
  ],
  exports: [PurchaseInvoiceService, PurchaseInvoiceHelperService],
})
export class PurchaseInvoiceModule {}
