import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PublicApiService } from "./public_api_service";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { CreatePublicServiceCreateDto } from "./dto/public_service.create.dto";
import { Public } from "../shared/decorators/public.decorator";
import { CreateRetailCustomerDto } from "../retailCustomers/dto/retail_customer_create";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";

@Controller("public_api")
@ApiTags("PublicApi")
@UseInterceptors(ErrorsInterceptor)
export class PublicApiController {
  constructor(private readonly service: PublicApiService) {}

  // get all details
  @Post("auth/details")
  @Public()
  @ApiBearerAuth()
  getAdminAuthDetails(@Body() body: any): Promise<any> {
    return this.service.getAdminAuthDetails(body);
  }

  // admin login
  @Post("admin/auth")
  @Public()
  @ApiBearerAuth()
  publicAdminLogin(@Body() loginBody: any, @Req() request): Promise<any> {
    return this.service.publicAdminLogin(loginBody);
  }

  // regiter staff
  @Post("staff/register")
  @ApiBearerAuth()
  @Public()
  publicStaffCreate(@Body() createDto: any, @Req() request): Promise<any> {
    return this.service.publicStaffCreate(createDto);
  }

  // regiter customer or supplier
  @Post("contact/register")
  @Public()
  @ApiBearerAuth()
  publicCustomerCreate(@Body() createDto: any, @Req() request): Promise<any> {
    return this.service.publicCustomerCreate(createDto);
  }
  @Post("retail/customer")
  @ApiBearerAuth()
  publicRetailCustomerCreate(
    @UserId() userId: number,
    @Body() createDto: CreateRetailCustomerDto
  ): Promise<any> {
    return this.service.publicRetailCustomerCreate(createDto, userId);
  }

  // staff login
  @Post("staff/auth")
  @Public()
  @ApiBearerAuth()
  publicLogin(@Body() loginBody: any, @Req() request): Promise<any> {
    return this.service.publicStaffLogin(loginBody);
  }

  // create service
  @Post("create_service")
  @ApiTags()
  createService(@Body() createDto: CreatePublicServiceCreateDto): Promise<any> {
    return this.service.createService(createDto);
  }
  // create bulk service
  @Post("create_bulk_service")
  @ApiTags()
  createBulkService(
    @Body() createDto: CreatePublicServiceCreateDto[]
  ): Promise<any> {
    return this.service.createBulkService(createDto);
  }

  // get invoice number
  @Get("/getInvoiceNo/:companyid/:locationId/:type")
  @ApiBearerAuth()
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "locationId", required: true })
  @ApiParam({ name: "type", required: true })
  getInvoiceNo(
    @UserId() userId: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("locationId", new ParseIntPipe()) locationId: number,
    @Param("type") type: string
  ): Promise<any> {
    return this.service.getInvoiceNo(userId, companyid, locationId, type);
  }

  // create sales invoice
  @Post("sales/create_sale_invoice")
  @ApiTags()
  createSalesInvoice(@Body() createDto: any): Promise<any> {
    return this.service.createSalesInvoice(createDto);
  }

  // create staff sales invoice
  @Post("staff/create_sale_invoice")
  @ApiTags()
  createStaffSaleInvoice(@Body() createDto: any): Promise<any> {
    return this.service.createStaffSaleInvoice(createDto);
  }

  //create bulk invoice numbers
  @Get("/getInvoiceNumbers/:companyid/:locationId/:type")
  @ApiBearerAuth()
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "locationId", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiQuery({ name: "ldate", required: false })
  getBulkInvoiceNo(
    @UserId() userId: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("locationId", new ParseIntPipe()) locationId: number,
    @Param("type") type: string,
    @Query() query: any
  ): Promise<any> {
    return this.service.getBulkInvoiceNo(
      query,
      userId,
      companyid,
      locationId,
      type
    );
  }

  // bulk create staff sales invoice
  @Post("staff/bulk-sale-invoices")
  @ApiTags()
  createBulkStaffSaleInvoice(@Body() createDto: any): Promise<any> {
    return this.service.createBulkStaffSaleInvoice(createDto);
  }

  // get one invoice
  @Get("/getSalesInvoice/:id/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  getSalesInvoice(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.service.getSalesInvoice(id, type);
  }

  @Post("create_staff_transaction")
  @ApiTags()
  createStaffTransaction(@Body() createDto: any): Promise<any> {
    return this.service.createStaffTransaction(createDto);
  }

  @Post("staff/transactions/create")
  @ApiTags()
  createBulkStaffTransaction(@Body() createDto: any): Promise<any> {
    return this.service.createBulkStaffTransaction(createDto);
  }

  // close staff payment to taxgo account

  @Post("close_payment")
  @ApiTags()
  createPaymentToLedger(@Body() createDto: any): Promise<any> {
    return this.service.createPaymentToLedger(createDto);
  }

  // staff transaction list

  @Post("/transaction-list")
  @ApiBearerAuth()
  list(@UserId() userId: number, @Body() create: any): Promise<any> {
    return this.service.findAllStaffTransactions(create, userId);
  }

  // list all banks for a company

  @Get("getAllBanks/:adminid/:companyid")
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  findAllBanks(
    @Param("id", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.service.findAllBanks(adminid, companyid);
  }

  // get products by location

  @Get("getProductByLocation/:id")
  @ApiParam({ name: "id", required: true })
  findProductByLocation(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.findProductByLocation(id);
  }

  @Get("getProductCategory/:adminid/:companyid")
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiBearerAuth()
  findProductCat(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.findProductCat(adminid, companyid);
  }

  // add Sup other payment //

  @Post("addSupOtherPaymentCash")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addSupOtherPayment(
    @Body() supplierPaymentDto: any
  ): Promise<CommonResponseDto> {
    return this.service.addSupOtherPayment(supplierPaymentDto);
  }

  // add Sup other reciept //

  @Post("addOtherReceipt")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  addOtherReceipt(@Body() customerPaymentDto: any): Promise<CommonResponseDto> {
    return this.service.addOtherReceipt(customerPaymentDto);
  }

  // get bank datas in taxgo //

  @Get("/getBankList/:id/:companyid")
  @ApiOkResponse({ type: CommonResponseDto })
  @SubscriptionFree()
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  getBankList(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.getBankList(id, companyid);
  }

  // add purchase invoice to taxgo //

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
}
