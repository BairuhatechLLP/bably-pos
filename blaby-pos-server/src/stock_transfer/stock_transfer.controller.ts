import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";
import { StockTransferService } from "./stock_transfer.service";
import { CreateStockTransferDto } from "./dto/createStockTransfer.dto";
import { UserId } from "../shared/decorators/userId_decorator";
import { UpdateStockTransferDto } from "./dto/updateStockTransfer.dto";

@Controller("stockTransfer")
@ApiTags("stockTransfer")
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
export class StockTransferController {
  constructor(private readonly StockTransferService: StockTransferService) {}

  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(): Promise<CommonResponseDto> {
    return this.StockTransferService.findAll();
  }

  @Get("/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.StockTransferService.findOne(id);
  }

  @Get("/list/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  findAllByCompany(
    @UserId() adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.StockTransferService.findAllByCompany(companyid,adminid);
  }

  @Post()
  @ApiCreatedResponse()
  @ApiBearerAuth()
  create(
    @Body() CreateStockTransferDto: CreateStockTransferDto,
    @UserId() adminid: number,
  ): Promise<CommonResponseDto> {
    return this.StockTransferService.create(adminid,CreateStockTransferDto);
  }

  @Put("/:id")
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  update(
    @Body() updateStockTransferDto: UpdateStockTransferDto,
    @Param("id", new ParseIntPipe()) id: number,
    @UserId() adminid: number,
  ): Promise<CommonResponseDto> {
    return this.StockTransferService.update(id,adminid,updateStockTransferDto);
  }

  @Delete(":id")
  @ApiOkResponse()
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number,
  ): Promise<any> {
    return this.StockTransferService.delete(id);
  }

}
