import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { AuthService } from "../auth/auth.service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import { ProductMasterService } from "../product_master/product_master_service";
import { AccountMasterService } from "../account_master/account_master_service";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { RetailCustomerService } from "../retailCustomers/retail_customer_service";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";
import { ProductCategoryService } from "../product_category/product_category_services";
import { isArray } from "class-validator";
import { BankService } from "../bank/bank_service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { OtherMasterService } from "../other_master/other_master.service";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
@Injectable()
export class PublicApiService {
  @Inject(ContactMasterService)
  private readonly contact_master: ContactMasterService;

  @Inject(RetailCustomerService)
  private readonly retail_master: RetailCustomerService;

  @Inject(SalesInvoiceService)
  private readonly sale_invoice: SalesInvoiceService;

  @Inject(PurchaseInvoiceService)
  private readonly purchase_invoice: PurchaseInvoiceService;

  @Inject(AuthService)
  private readonly auth_service: AuthService;

  @Inject(StaffTransactionsService)
  private readonly staff_transaction: StaffTransactionsService;

  @Inject(ProductMasterService)
  private readonly product_master: ProductMasterService;

  @Inject(AccountMasterService)
  private readonly account_master: AccountMasterService;

  @Inject(UserSettingsService)
  private readonly userSettings: UserSettingsService;

  @Inject(ProductLocationMasterService)
  private readonly productLocationMasterService: ProductLocationMasterService;

  @Inject(ProductCategoryService)
  private readonly product_Cat: ProductCategoryService;

  @Inject(BankService)
  private readonly BankService: BankService;

  @Inject(forwardRef(() => LedgerDetailsService))
  private readonly ledger_details: LedgerDetailsService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService;
  constructor() {}

  async getAdminAuthDetails(body: any) {
    try {
      return await this.auth_service.getOverallAdminDetails(body);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async publicAdminLogin(loginBody: any) {
    try {
      return await this.auth_service.login(loginBody);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async publicStaffCreate(createDto: any) {
    try {
      const data = await this.contact_master.createStaff(createDto);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async publicCustomerCreate(createDto: any) {
    try {
      const data = await this.contact_master.create(createDto);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async publicRetailCustomerCreate(createDto: any, userId: number) {
    try {
      const data = await this.retail_master.create(createDto, userId);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async publicStaffLogin(loginBody: any) {
    try {
      let response = await this.auth_service.staffEmailLogin(loginBody);
      if (response.status) {
        let details = response.data;
        let obj = {
          userId: details.staff.id,
          token: details.token,
        };
        return new CommonResponseDto(obj, true, "User logged in successfully");
      } else {
        return response;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createSalesInvoice(createDto: any) {
    try {
      if (createDto?.columns.length) {
        let response = this.sale_invoice.create(createDto);
        return response;
      }
      return new CommonResponseDto(
        null,
        false,
        "Please provide invoice details!!"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getInvoiceNo(
    userId: number,
    companyId: number,
    locationId: number,
    type: string
  ) {
    try {
      const data = await this.userSettings.getInvoiceNo(
        userId,
        companyId,
        locationId,
        type
      );
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createStaffSaleInvoice(create: any) {
    try {
      let response = await this.sale_invoice.stafCreateSale(create);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getBulkInvoiceNo(
    query: any,
    userId: number,
    companyId: number,
    locationId: number,
    type: string
  ) {
    try {
      if (!query.count || Number(query.count) <= 0) {
        return new CommonResponseDto(
          null,
          false,
          "Please provide the count for generating invoice number"
        );
      }
      const data = await this.userSettings.getInvoiceNo(
        userId,
        companyId,
        locationId,
        type
      );
      if (!data.status) {
        return new CommonResponseDto(
          null,
          false,
          "Failed to generating invoice number"
        );
      }

      const invoiceNo = data?.data;
      const [label, baseInvoiceNo] = invoiceNo
        .split("-")
        .map((part) => part.trim());
      const invoiceNos = Array.from({ length: Number(query.count) }, (_, i) => {
        const newInvoiceNo = Number(baseInvoiceNo) + i;
        return `${label}-${newInvoiceNo}`;
      });
      return new CommonResponseDto(
        invoiceNos,
        true,
        "Invoice numbers generated successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createBulkStaffSaleInvoice(createDto: any) {
    try {
      if (!isArray(createDto.data) && createDto.data.length === 0) {
        return new CommonResponseDto(
          null,
          false,
          "Please provide invoice details"
        );
      }
      let responseData = [];
      for (const element of createDto.data) {
        let data = await this.sale_invoice.stafCreateSale(element);
        responseData.push(data.data);
      }
      return new CommonResponseDto(
        responseData,
        true,
        "Sales invoice created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSalesInvoice(id: number, type: string) {
    try {
      const data = await this.sale_invoice.findByCustomer(id, type);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createStaffTransaction(create: any) {
    try {
      let data = await this.staff_transaction.create(create);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createBulkStaffTransaction(create: any) {
    try {
      if (!Array(create?.invoiceData) || create?.invoiceData?.length === 0) {
        return new CommonResponseDto(
          null,
          false,
          "Please provide invoice details"
        );
      }
      let data = await this.staff_transaction.bulkCreate(
        create?.counterId,
        create?.type,
        create?.invoiceData
      );
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createPaymentToLedger(create: any) {
    try {
      let data = await this.staff_transaction.pymentCreateToLedeger(create);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createService(createDto: any) {
    try {
      let data = await this.product_master.create(createDto);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async createBulkService(createDto: any) {
    try {
      const result = [];
      if (createDto?.length) {
        for (const element of createDto) {
          let data = await this.product_master.create(element);
          result.push(data);
        }
      }
      return new CommonResponseDto(
        result,
        true,
        "Service created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllBanks(adminid: number, companyid: any) {
    try {
      let data = await this.account_master.getBankList(adminid, companyid);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllStaffTransactions(dataDto: any, userId: number) {
    try {
      let data = await this.staff_transaction.list(userId, dataDto);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findProductCategory(adminid: number, companyid: any) {
    try {
      let data = await this.product_master.findAllByAdminId(adminid, companyid);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findProductCat(adminid: number, companyid: any) {
    try {
      let data = await this.product_Cat.findAllUser(adminid, companyid);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findProductByLocation(id: number) {
    try {
      let data = await this.productLocationMasterService.findOne(id);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // addsupplier other payment //

  async addSupOtherPayment(req: any[]): Promise<CommonResponseDto> {
    let response: CommonResponseDto = {
      status: true,
      message: "All payments processed successfully.",
      data: [],
    };
    try {
      for (const element of req) {
        const res = await this.purchase_invoice.addSupOtherPayment(element);
        response?.data?.push(res?.data);
      }
    } catch (error) {
      console.error("Error in addSupOtherPayment:", error);
      response = {
        status: false,
        message: "Oops! Something went wrong on the server.",
        data: error,
      };
    }

    return response;
  }

  async addOtherReceipt(req: any[]): Promise<CommonResponseDto> {
    let response: CommonResponseDto = {
      status: true,
      message: "All payments processed successfully.",
      data: [],
    };
    try {
      for (const element of req) {
        const res = await this.sale_invoice.addOtherReceipt(element);
        response?.data?.push(res?.data);
      }
    } catch (error) {
      console.error("Error in addOtherReceipt:", error);
      response = {
        status: false,
        message: "Oops! Something went wrong on the server.",
        data: error,
      };
    }

    return response;
  }
  
  async stafPurchasecreate(req: any[]): Promise<CommonResponseDto> {
    let response: CommonResponseDto = {
      status: true,
      message: "All purchase invoice created successfully.",
      data: [],
    };
    try {
      for (const element of req) {
        const res = await this.purchase_invoice.stafPurchasecreate(element);
        response?.data?.push(res?.data);
      }
    } catch (error) {
      console.error("Error in staff Purchase create:", error);
      response = {
        status: false,
        message: "Oops! Something went wrong on the server.",
        data: error,
      };
    }

    return response;
  }

  async getBankList(adminid, companyid) {
    let data = await this.account_master.getBankList(adminid, companyid);
    return data;
  }
}
