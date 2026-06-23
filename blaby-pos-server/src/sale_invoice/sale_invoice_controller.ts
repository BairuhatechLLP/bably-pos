import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiBody,
} from "@nestjs/swagger";
import { SalesInvoiceService } from "./sale_invoice_service";
import { SaleInvoice as SalesInvoiceEntity } from "./sale_invoice";
import { SalesInvoiceDto } from "./dto/sale_invoice_dto";
import { PageDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UserId } from "../shared/decorators/userId_decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { CloseShiftDto } from "./dto/sales_invoice_create_new.dto";

@Controller("SaleInvoice")
@ApiTags("SaleInvoice")
@UseInterceptors(ErrorsInterceptor)
export class SalesInvoiceController {
  constructor(private readonly saleInvoiceService: SalesInvoiceService) {}

  @Get("stripe/succes")
  stripeSucces(@Query() customerPaymentDto: any): Promise<any> {
    return this.saleInvoiceService.stripeSuccess(customerPaymentDto);
  }
  @Get("stripe/fail")
  stripeFail(@Query() customerPaymentDto: any): Promise<any> {
    return this.saleInvoiceService.stripeFail();
  }
  @Get("/scredit_invoice/:adminid/:customerid")
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "customerid", required: true })
  findScreditDataByType(
    @Param("customerid", new ParseIntPipe()) customerid: any,
    @Param("adminid", new ParseIntPipe()) adminid: any
  ): Promise<any> {
    return this.saleInvoiceService.findScreditDataByType(customerid, adminid);
  }

  //----------------------

  @Get("/list/:id/:companyid/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  findAllSalesInvoice(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.findAllList(id, companyid, type);
  }

  @Get("/lists/:id/:staffId/:companyid/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [SalesInvoiceDto] })
  findAllPages(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("staffId", new ParseIntPipe()) staffId: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string,
    @Query() pageOptionsDto: PageOptionsDto
  ) {
    return this.saleInvoiceService.findAllListByUser(
      id,
      staffId,
      companyid,
      type,
      pageOptionsDto
    );
  }

  @Get("/list/byDate/:id/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  findAllSalesByDate(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<any> {
    return this.saleInvoiceService.findAllByDate(id, sdate, ldate);
  }

  @Get("/getListByCustmer/:companyid/:customerid/:locationId/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "customerid", required: true })
  @ApiParam({ name: "locationId", required: true })
  @ApiParam({ name: "type", required: true })
  findAllSalesInvoiceByCustomer(
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("customerid", new ParseIntPipe()) customerid: number,
    @Param("locationId", new ParseIntPipe()) locationId: number,
    @Param("type") type: string
  ): Promise<any> {
    return this.saleInvoiceService.findAllListBySupplier(
      companyid,
      customerid,
      locationId,
      type
    );
  }

  @Get("/viewInvoice/:id/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  findOneByType(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.findByCustomer(id, type);
  }

  @Get("/viewInvoice/:invoiceno")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "invoiceno", required: true })
  findOneByInvoiceno(
    @Param("invoiceno") invoiceno: string
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.getSalesByInvoiceNumber(invoiceno);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [SalesInvoiceDto] })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<SalesInvoiceDto>> {
    return this.saleInvoiceService.findAll(pageOptionsDto);
  }

  // @Get("/getInvoiceNo/:id/:type")
  // @ApiBearerAuth()
  // @ApiOkResponse({ type: CommonResponseDto })
  // @ApiParam({ name: "id", required: true })
  // @ApiParam({ name: "type", required: true })
  // getInvoiceNo(
  //   @Param("id", new ParseIntPipe()) id: number,
  //   @Param("type") type: string
  // ): Promise<CommonResponseDto> {
  //   return this.saleInvoiceService.getInvoiceNo(id, type);
  // }

  @Get("/listCustomerPay/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  listCustomerPay(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid") adminid: number
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.listCustomerPay(id, adminid);
  }

  @Get("/customerPayidList/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  customerPayidList(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid") adminid: number
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.customerPayidList(id, adminid);
  }

  @Get("/customerRefundidList/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  customerRefundidList(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid") adminid: number
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.customerRefundidList(id, adminid);
  }

  @Get(":id")
  @ApiOkResponse({ type: SalesInvoiceDto })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<SalesInvoiceDto> {
    return this.saleInvoiceService.findOne(id);
  }

  @Post("add")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(@Body() createSalesInvoiceDto: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.create(createSalesInvoiceDto);
  }

  //credi note new
  @Post("addCreditNew")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  createCreditNew(
    @Body() createSalesInvoiceDto: any
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.createCreditNew(createSalesInvoiceDto);
  }

  @Put("/updateCreditnoteWithoutReversal/:id")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateCreditNoteWithoutStockReversal(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateSalesInvoiceDto: any
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.updateCreditNoteWithoutStockReversal(
      id,
      updateSalesInvoiceDto
    );
  }

  @Post("customerPayment")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  customerPayment(@Body() customerPaymentDto: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.customerPayment(customerPaymentDto);
  }

  @Post("addCustReceipt")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addCustReceipt(@Body() addCustReceipt: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.addCustReceipt(addCustReceipt);
  }

  @Post("addCustReceiptCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addCustReceiptCash(@Body() addCustReceipt: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.addCustReceiptCash(addCustReceipt);
  }

  @Post("addCustRefund")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addCustRefund(@Body() addCustReceipt: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.addCustRefund(addCustReceipt);
  }

  @Post("addCustRefundCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addCustRefundCash(@Body() addCustReceipt: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.addCustRefundCash(addCustReceipt);
  }

  @Post("sendEmail")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  sendEmail(@Body() sendMailData: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.sendEmail(sendMailData);
  }

  @Post("/salesList")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  salesList(@Body() getSalesListReq: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.getSalesList(
      getSalesListReq.adminid,
      getSalesListReq.sdate,
      getSalesListReq.ldate,
      getSalesListReq.type
    );
  }

  @Put("update/:id")
  @ApiBody({})
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateSalesInvoiceDto: any
  ): Promise<Object> {
    return this.saleInvoiceService.update(id, updateSalesInvoiceDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: SalesInvoiceEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<SalesInvoiceEntity> {
    return this.saleInvoiceService.delete(id);
  }

  @Post("cancel/:id")
  @ApiOkResponse({ type: SalesInvoiceEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  cancelInvoice(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<SalesInvoiceEntity> {
    return this.saleInvoiceService.cancelInvoice(id);
  }

  @Post("addOtherReceipt")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addOtherReceipt(@Body() customerPaymentDto: any): Promise<CommonResponseDto> {
    return this.saleInvoiceService.addOtherReceipt(customerPaymentDto);
  }

  @Get("/stock/:id/:stockid/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "stockid", required: true })
  @ApiParam({ name: "type", required: true })
  findSalesInvoice(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("stockid", new ParseIntPipe()) stockid: number,
    @Param("type") type: string
  ): Promise<Object> {
    return this.saleInvoiceService.findSalesInvoice(id, stockid, type);
  }
  @Get("/month/:id/:stockid/:type/:month")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "stockid", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiParam({ name: "month", required: true })
  findSalesInvoices(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("stockid", new ParseIntPipe()) stockid: number,
    @Param("type") type: string,
    @Param("month") targetMonth: string
  ): Promise<Object> {
    return this.saleInvoiceService.findSalesInvoicemonth(
      id,
      stockid,
      type,
      targetMonth
    );
  }

  @Get("/:adminid/:supplierid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "supplierid", required: true })
  @ApiParam({ name: "sdate" })
  @ApiParam({ name: "ldate" })
  @ApiOkResponse({ type: CommonResponseDto })
  async findAllListBySupplierByRange(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("supplierid", new ParseIntPipe()) supplierid: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<object> {
    return this.saleInvoiceService.findAllListBySupplierByRange(
      adminid,
      supplierid,
      sdate,
      ldate
    );
  }

  @Get("/getSalesDetails/:id")
  async findByAllSales(@Param("id", new ParseIntPipe()) id: number) {
    try {
      const result = await this.saleInvoiceService.findByAllSales(id);
      return result;
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: "Internal server error",
        data: null,
      };
    }
  }
  @Post("add/staff_create_sale")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  stafCreateSale(
    @Body() createSalesInvoiceDto: any
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.stafCreateSale(createSalesInvoiceDto);
  }

  @Get("delete-invoice/:id/:type")
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  removePurchaseInvoice(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: any,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.removeSalesInvoice(userId, id, type);
  }

  @Post("shift-close")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBody({
    type: CloseShiftDto,
    description: "Shift closure data",
  })
  @ApiBearerAuth()
  closeShift(
    @Body() createdto: CloseShiftDto,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.saleInvoiceService.closeShift(createdto, userId);
  }
}
