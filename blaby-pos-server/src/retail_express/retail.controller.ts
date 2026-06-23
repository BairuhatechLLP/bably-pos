import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { RetailService } from "./retail.service";
import { PageOptionsDto } from "../shared/dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";

@Controller("retail")
@ApiTags("retail")
@UseInterceptors(ErrorsInterceptor)
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Post("/getProductByLocation")
  @ApiBearerAuth()
  findProductbyLocation(
    @Body() body: any,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<any> {
    return this.retailService.findProductbyLocation(body, pageOptionsDto);
  }

  @Post("/productlist")
  @ApiBearerAuth()
  findByAdminIdAndType(
    @Body() body: any,
    @UserId() userid:any,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<any> {
    return this.retailService.findAllListProduct(body,userid, pageOptionsDto);
  }

  @Post("/ProductList/byId")
  @ApiBearerAuth()
  findProductById(@Body() body: any): Promise<any> {
    return this.retailService.findProductByIdService(body);
  }

  @Get("/customerlist/:type/:id/:createdBy/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "createdBy", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllAirline(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("createdBy", new ParseIntPipe()) createdBy: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<CommonResponseDto> {
    return this.retailService.findAllListCustomers(
      id,
      createdBy,
      companyid,
      type,
      pageOptionsDto
    );
  }

  @Get("/invoicelist/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiParam({ name: "id", required: true })
  findAllSalesInvoice(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<Object> {
    return this.retailService.findAllListInvoice(id, "sales");
  }

  @Get("/viewInvoice/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOneByType(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.retailService.findDetailInvoice(id, "sales");
  }

  @Post("addRetail")
  @ApiBody({})
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  createSales(@Body() createSalesInvoiceDto: any): Promise<CommonResponseDto> {
    return this.retailService.createInvoiceRetail(createSalesInvoiceDto);
  }

  @Get("/invoice/type/:paidtype/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "paidtype", required: true })
  findByPaidType(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("paidtype") paidtype: string
  ): Promise<CommonResponseDto> {
    return this.retailService.findByPaidType(id, paidtype);
  }
  @Get("/invoice/search/:type/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  async findInvoiceBySearch(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.retailService.findInvoiceBySearch(id, type);
  }
}
