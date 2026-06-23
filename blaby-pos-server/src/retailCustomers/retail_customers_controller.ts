import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { UserId } from "../shared/decorators/userId_decorator";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { RetailCustomerService } from "./retail_customer_service";
import { CreateRetailCustomerDto } from "./dto/retail_customer_create";
import { RetailCustomerEntity } from "./retail_customer_entity";
import { UpdateRetailCustomer } from "./dto/retail_customer_update";

@Controller("retailCustomer")
@ApiTags("retailCustomer")
@UseInterceptors(ErrorsInterceptor)
export class RetailCustomerController {
  constructor(private readonly retailCustomerService: RetailCustomerService) {}

  @Post("/getRetailCustomer")
  @ApiOkResponse({ type: CommonResponseDto })
  findByAdminid(@UserId() userId: number, @Body() body: any): Promise<any> {
    return this.retailCustomerService.findAllByAdminid(body, userId);
  }

  @Get("/findOne/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(@UserId() userId: number, @Param("id") id: any): Promise<any> {
    return this.retailCustomerService.findOne(id, userId);
  }

  @Post("/retailCustomer/add")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @UserId() userId: number,
    @Body() createRetailCustomerDto: CreateRetailCustomerDto
  ): Promise<any> {
    return this.retailCustomerService.create(createRetailCustomerDto, userId);
  }

  @Put("/update/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetailCustomerEntity })
  @ApiParam({ name: "id", required: true })
  update(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateRetailCustomer
  ): Promise<any> {
    return this.retailCustomerService.update(id, userId, updateDto);
  }

  @Put("/updateOutstanding/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: RetailCustomerEntity })
  @ApiParam({ name: "id", required: true })
  updateOutstanding(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateRetailCustomer
  ): Promise<any> {
    return this.retailCustomerService.updateOutstanding(id, userId, updateDto);
  }

  @Get("/list/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  findAll(
    @UserId() userId: number,
    @Param("companyid") companyid: number
  ): Promise<any> {
    return this.retailCustomerService.findAll(userId, companyid);
  }

  @Get("/getRetailCustomerInvoices/:companyid/:customerid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  getRetailCustomerInvoices(
    @UserId() userId: number,
    @Param("companyid") companyid: number,
    @Param("customerid") customerid: number
  ): Promise<any> {
    return this.retailCustomerService.getRetailCustomerInvoices(
      userId,
      companyid,
      customerid
    );
  }
}
