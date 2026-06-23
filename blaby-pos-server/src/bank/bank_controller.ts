import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
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
  ApiQuery,
} from "@nestjs/swagger";
import { BankService } from "./bank_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { PageOptionsDto } from "../shared/dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";

@Controller("bank")
@ApiTags("bank")
@UseInterceptors(ErrorsInterceptor)
export class BankController {
  constructor(private readonly service: BankService) {}

  @Get("/bankDetails/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  getBankDetails(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.getBankDetails(id, adminid);
  }

  @Get("/transactions")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiQuery({ name: "companyid", required: true })
  @ApiQuery({ name: "type", required: false })
  @ApiQuery({ name: "sdate", required: false })
  @ApiQuery({ name: "ldate", required: false })
  getTransactions(
    @UserId() userId: number,
    @Query() dataObj:any
  ): Promise<CommonResponseDto> {
    return this.service.getTransactions(userId,dataObj);
  }

  @Get("/bankTransferView/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  bankTransferView(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.bankTransferView(id);
  }

  @Get("/viewTransfer/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  viewTransfer(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.viewTransfer(id);
  }

  @Get("/getBankingTransactionDetail/:adminid/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  getBankingTransactionDetail(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.getBankingTransactionDetail(id, adminid);
  }

  // @Get("/listBankActivity")
  // @ApiBearerAuth()
  // @ApiOkResponse({ type: CommonResponseDto })
  // @ApiParam({ name: "adminid", required: true })
  // @ApiParam({ name: "id", required: true })
  // @ApiParam({ name: "sdate", required: true })
  // @ApiParam({ name: "ldate", required: true })
  // @ApiBearerAuth()
  // listBankActivity(
  //   @Param("adminid", new ParseIntPipe()) adminid: number,
  //   @Param("id", new ParseIntPipe()) id: number,
  //   @Param("sdate") sdate: String,
  //   @Param("ldate") ldate: String
  // ): Promise<CommonResponseDto> {
  //   return this.service.listBankActivity(adminid, id, sdate, ldate);
  // }

  @Get("/cashList/:adminid/:id/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "id", required: true })
  findByAdminIdAndTypeList(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<{ data: any }> {
    return this.service.listBankActivityList(
      adminid,
      id,
      pageOptionsDto,
      ldate,
      sdate
    );
  }

  @Get("/listBankActivity/:adminid/:id/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "id", required: true })
  listBankActivityList2(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<{ data: any }> {
    return this.service.listBankActivityList2(
      adminid,
      id,
      pageOptionsDto,
      ldate,
      sdate
    );
  }

  @Post("/bankTransfer")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  bankTransfer(@Body() bankTransferReq: any): Promise<CommonResponseDto> {
    return this.service.bankTransfer(bankTransferReq);
  }

  @Post("/deleteBankTransfer")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  deleteBankTransfer(
    @Body() bankTransferDelReq: any
  ): Promise<CommonResponseDto> {
    return this.service.deleteBankTransfer(bankTransferDelReq);
  }

  @Get("/listSupplierRefund/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  listSupplierRefund(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.listSupplierRefund(id, adminid);
  }

  @Get("/listCustomerRefund/:id/:adminid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  listCustomerRefund(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.listCustomerRefund(id, adminid);
  }
  @Put("/listBankActivity/:adminid/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  updatelistBankActivity(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<any> {
    return this.service.updatelistBankActivity(id, adminid);
  }
}
