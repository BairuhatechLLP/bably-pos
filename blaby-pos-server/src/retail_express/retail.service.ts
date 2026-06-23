import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ProductMasterService } from "../product_master/product_master_service";
import { PageOptionsDto } from "../shared/dto";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";

@Injectable()
export class RetailService {
  constructor(
    private readonly productMasterService: ProductMasterService,
    private readonly service: ContactMasterService,
    private readonly saleInvoiceService: SalesInvoiceService, // private readonly saleInvoiceService: SalesInvoiceService,
    private readonly productLocationMasterService: ProductLocationMasterService
  ) {}

  async findProductbyLocation(body: any, pageOptionsDto: any) {
    try {
      return await this.productLocationMasterService.findRetailProductsByLocation(
        body,
        pageOptionsDto
      );
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  async findAllListProduct(dto: any, userid: any, pageOptionsDto: any) {
    try {
      let body = { ...dto, id: userid };
      return await this.productMasterService.findAllByAdminIdAndTypeRetail(
        body,
        pageOptionsDto
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findProductByIdService(body: any) {
    try {
      return await this.productMasterService.findProductById(body?.product);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllListCustomers(
    id: any,
    createdBy: number,
    companyid: number,
    type: string,
    pageOptionsDto: PageOptionsDto
  ) {
    try {
      return await this.service.findAll(
        id,
        createdBy,
        companyid,
        type,
        pageOptionsDto
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllListInvoice(id: any, type: string) {
    try {
      return await this.saleInvoiceService.findAllListRetail(id, type);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findDetailInvoice(id: number, type: string) {
    try {
      return await this.saleInvoiceService.findByCustomerRetail(id, type);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async createInvoiceRetail(createSalesInvoiceDto: any) {
    try {
      return await this.saleInvoiceService.createRetail(createSalesInvoiceDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByPaidType(id: number, type: any) {
    try {
      return await this.saleInvoiceService.findBypaidTypes(id, type);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findInvoiceBySearch(id: number, type: any) {
    try {
      return await this.saleInvoiceService.findInvoiceBySearch(id, type);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
