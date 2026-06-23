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

import { PurchaseInvoiceService } from "./purchase_invoice_service";
import { PurchaseInvoice } from "./purchase_invoice_model";
import { PurchaseInvoiceDto } from "./dto/purchase_invoice_dto";
import { PageOptionsDto } from "./../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreatePurhcaseReceiptDto } from "./dto/purchase_receipt_create_dto";
import { UserId } from "../shared/decorators/userId_decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("purchaseinvoice")
@ApiTags("Purchaseinvoice")
@UseInterceptors(ErrorsInterceptor)
export class PurchaseInvoiceController {
  constructor(private readonly service: PurchaseInvoiceService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [PurchaseInvoiceDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }
  @Get("/list/:id/:type")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  findAllPurchaseInvoice(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<Object> {
    return this.service.findAllListByShowBusName(id, type);
  }

  @Get("/list/:id/:createdBy/:companyid/:type")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "createdBy", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  findAllPurchaseInvoicePage(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("createdBy", new ParseIntPipe()) createdBy: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string
  ): Promise<Object> {
    return this.service.findAllPurchaseInvoicePage(
      id,
      createdBy,
      companyid,
      type
    );
  }
  //create
  @Post("add")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(@Body() createDto: any, @Req() request): Promise<CommonResponseDto> {
    return this.service.create(createDto);
  }

  //update
  @Put("update/:id")
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateSalesInvoiceDto: any,
  ): Promise<Object> {
    return this.service.update(id, updateSalesInvoiceDto);
  }

  @Get("/getInvoiceNo/:id/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  getInvoiceNo(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.service.getInvoiceNo(id, type);
  }

  @Get("/listSupplierPay/:id/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  listSupplierPay(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Query() debit: any
  ): Promise<CommonResponseDto> {
    return this.service.listSupplierPay(id, adminid, companyid, debit);
  }

  @Get("/getByLocationAndSupplier")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  findByLocationAndSupplier(
    @UserId() userId:number,
    @Query() queryData: any
  ): Promise<CommonResponseDto> {
    return this.service.findByLocationAndSupplier(userId,queryData);
  }

  @Get("/supplierPayidList/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  supplierPayidList(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.supplierPayidList(id, adminid);
  }

  @Get("/viewInvoice/:id/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  findOneByType(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.service.findBySupplier(id, type);
  }
  //delete
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: PurchaseInvoiceDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<PurchaseInvoiceDto> {
    return this.service.delete(id);
  }

  @Post("addSuppReceipt")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSuppReceipt(
    @Body() createDto: CreatePurhcaseReceiptDto
  ): Promise<CommonResponseDto> {
    return this.service.addSuppReceipt(createDto);
  }
  @Post("addSuppReceiptCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSuppReceiptCash(
    @Body() createDto: CreatePurhcaseReceiptDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.addSuppReceiptCash(createDto);
  }
  @Post("addSuppReceiptBankNew")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSuppReceiptBankNew(
    @Body() createDto: CreatePurhcaseReceiptDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.addSuppReceiptBankNew(createDto);
  }

  @Post("addSuppRefund")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSupplierRefund(
    @Body() createDto: CreatePurhcaseReceiptDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.addSupplierRefund(createDto);
  }

  @Post("addSuppRefundCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSuppRefundCash(
    @Body() createDto: CreatePurhcaseReceiptDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.addSuppRefundCash(createDto);
  }

  @Post("supplierpayment")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  supplierPayment(@Body() supplierPaymentDto: any): Promise<CommonResponseDto> {
    return this.service.supplierPayment(supplierPaymentDto);
  }

  @Post("addSupOtherPayment")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSupOtherReceipt(
    @Body() supplierPaymentDto: any
  ): Promise<CommonResponseDto> {
    return this.service.addSupOtherReceipt(supplierPaymentDto);
  }

  @Post("addSupOtherPaymentCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSupOtherPayment(
    @Body() supplierPaymentDto: any
  ): Promise<CommonResponseDto> {
    return this.service.addSupOtherPayment(supplierPaymentDto);
  }

  @Post("cancel/:id")
  @ApiOkResponse({ type: PurchaseInvoice })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  cancelInvoice(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<PurchaseInvoice> {
    return this.service.cancelInvoice(id);
  }
  @Get("/month/:id/:stockid/:type")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "stockid", required: true })
  @ApiParam({ name: "type", required: true })
  findAllPurchase(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("stockid", new ParseIntPipe()) stockid: number,
    @Param("type") type: string
  ): Promise<Object> {
    return this.service.findAllPurchaseList(id, stockid, type);
  }
  @Get("/bymonth/:id/:stockid/:month")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "stockid", required: true })
  @ApiParam({ name: "month", required: true })
  findAllInvoicesByMonth(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("stockid", new ParseIntPipe()) stockid: number,
    @Param("month") targetMonth: string
  ): Promise<Object> {
    return this.service.findAllInvoicesByMonth(id, stockid, targetMonth);
  }
  @Get("purchaseListBySupplier/:adminid/:supplierid/:sdate/:ldate")
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
    return this.service.findAllListBySupplierByRange(
      adminid,
      supplierid,
      sdate,
      ldate
    );
  }

  @Get("listByDateFilter/:id/:createdBy/:companyid/:type/:sdate/:ldate")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  async purchaseListByDate(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("createdBy", new ParseIntPipe()) createdBy: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<Object> {
    return this.service.purchaseListByDate(
      id,
      createdBy,
      companyid,
      type,
      sdate,
      ldate
    );
  }

  @Post("add/staff_create_purchase")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  stafPurchasecreate(
    @Body() createDto: any,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.stafPurchasecreate(createDto);
  }

  @Post("createRetailPurchase")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  createRetailPurchase(
    @Body() createDto: any,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.createRetailPurchase(createDto);
  }
  @Post("createBulkRetailPurchase")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  bulkRetailPurchase(
    @Body() createDto: any,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.bulkRetailPurchase(createDto);
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
    return this.service.removePurchaseInvoice(userId, id, type);
  }
}
