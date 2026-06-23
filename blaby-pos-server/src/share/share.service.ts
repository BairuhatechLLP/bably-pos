import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SalesInvoiceService } from '../sale_invoice/sale_invoice_service';
import { PurchaseInvoiceService } from '../purchase_invoice/purchase_invoice_service';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { UserService } from '../users/user.services';
import { CompanyMasterService } from '../company_master/company_master_service';

@Injectable()
export class ShareService {

  @Inject(forwardRef(()=>SalesInvoiceService))
  private readonly sale_invoice: SalesInvoiceService;

  @Inject(forwardRef(()=>PurchaseInvoiceService))
  private readonly purchase_invoice: PurchaseInvoiceService;

  @Inject(forwardRef(()=>UserService))
  private readonly user_service: UserService;

  @Inject(CompanyMasterService)
  private readonly company_service: CompanyMasterService;
  

  constructor() { }

  async invoiceDetails(id: number, type: string) {
    let response: CommonResponseDto = {
      status: false,
      message: null,
      data: null,
    };
    try {
      let responseData: any = type === "sales" ? await this.sale_invoice.findByCustomer(id, type) :
        await this.purchase_invoice.findBySupplier(id, type);
       
      if (responseData && responseData.data && responseData.data.invoiceDetails) {
        let userid = responseData.data.invoiceDetails.userid;
        let data = responseData.data;
        let userData = await this.user_service.getUser(userid);
        data.userInfo = userData.data;
        data.userInfo.companyInfo = await this.company_service.findOne(responseData.data.invoiceDetails.companyid)
        responseData.data = data;
        return responseData;
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
