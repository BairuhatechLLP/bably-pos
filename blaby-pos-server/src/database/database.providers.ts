import { Sequelize } from "sequelize-typescript";
import { User } from "./../users/user.entity";
import { ConfigService } from "./../shared/config/config.service";
import { CompanyMaster } from "./../company_master/company_master_entity";
import { Countries } from "./../countries/countries_model";
import { BusinessCategory } from "../business_category/business_category_entity";
import { Journal } from "./../journal/journal_model";
import { LedgerCategoryGroup } from "./../ledger_category_group/ledger_category_group_model";
import { AccountMaster } from "./../account_master/account_master";
import { LedgerDetails } from "./../ledger_details/ledger_details";
import { Tax } from "../tax_master/tax_master_entity";
import { LedgerCategory } from "./../ledger_category/ledger_category_model";
import { PurchaseInvoice } from "./../purchase_invoice/purchase_invoice_model";
import { ProductMaster } from "./../product_master/product_master";
import { SaleInvoice } from "../sale_invoice/sale_invoice";
import { UserSettings } from "../user_settings/user_settings_entity";
import { InvoiceItem } from "../invoice_item/invoice_items_entity";
import { AuditLog } from "../audit_log/audit_log_entity";
import { Merchant } from "../merchant/merchant_entity";
import { ProductCategory } from "../product_category/product_category_entity";
import { MailMaster } from "../mail_master/mail_master_entity";
import { unit } from "../units/unit.entity";
import { ReccuringNotification } from "../reccuring_notification/reccuring_notfication_entity";
import { PayrollEmployeeCategory } from "../payroll_employeeCategory/employeeCategoryEntity";
import { LocationMaster } from "../locations/location.entity";
import { PayrollEmployee } from "../payroll_employees/employeeEntity";
import { Contactus } from "../contactus/contactus-model";
import { PayrollPaySheet } from "../payroll_paySheet/paySheetEntity";
import { PayrollPaySheetItem } from "../payroll_paySheetItems/paysheetItemsEntity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { Proposal } from "../proposal/proposal_model";
import { StaffTransactions } from "../staff_transactions/staff_transactions_entity";
import { BlogMaster } from "../blog/blog.entity";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
import { CounterDetails } from "../counter_details/counter_details_entity";
import { DataTransferLog } from "../data_sync/datatranferlog.entity";
import { StripeLog } from "../stripe_log/stripe_log.entity";
import { HsnCode } from "../hsn_code/hsn_code.entity";
import { Plan } from "../PLAN/plan.entity";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { RetailCustomerEntity } from "../retailCustomers/retail_customer_entity";
import { ProductLocationMaster } from "../product_location_master/product_location.entity";
import { StockTransfer } from "../stock_transfer/stock_transfer.entity";
import { OrderMaster } from "../order_master/order_master.entity";
import { OrderItems } from "../order_items/order_items.entity";
import { Affiliations } from "../affiliations/affiliations-model";
import { BomMaster } from "../bom_master/bom_master.entity";
import { BomItems } from "../bom_items/bom_items.entity";
import { OtherMaster } from "../other_master/other_master.entity";
import { ProductionItems } from "../production_items/production_items.entity";
import { ProductionMaster } from "../production_master/production_master.entity";
import { DiningTable } from "../dining_table/dining_table.entity";
import { KitchenDisplay } from "../kitchen_display/kitchen_display.entity";

export const databaseProviders = [
  {
    provide: "SEQUELIZE",
    useFactory: async (configService: ConfigService) => {
        const sequelize = new Sequelize(configService.sequelizeOrmConfig);
        sequelize.addModels([
          User,
          CompanyMaster,
          BusinessCategory,
          Countries,
          Journal,
          LedgerCategoryGroup,
          AccountMaster,
          LedgerDetails,
          Tax,
          LedgerCategory,
          LedgerCategory,
          PurchaseInvoice,
          ProductMaster,
          SaleInvoice,
          UserSettings,
          InvoiceItem,
          AuditLog,
          Merchant,
          ProductCategory,
          MailMaster,
          unit,
          ReccuringNotification,
          PayrollEmployeeCategory,
          LocationMaster,
          PayrollEmployee,
          Contactus,
          PayrollPaySheetItem,
          PayrollPaySheet,
          ContactMaster,
          Proposal,
          BlogMaster,
          StaffTransactions,
          BillingCounter,
          CounterDetails,
          DataTransferLog,
          StripeLog,
          HsnCode,
          Plan,
          Subscriptions,
          RetailCustomerEntity,
          ProductLocationMaster,
          StockTransfer,
          OrderMaster,
          OrderItems,
          Affiliations,
          BomMaster,
          BomItems,
          OtherMaster,
          ProductionItems,
          ProductionMaster,
          DiningTable,
          KitchenDisplay
        ]);
        await sequelize.sync();
        return sequelize;
    },
    inject: [ConfigService],
  },
];
