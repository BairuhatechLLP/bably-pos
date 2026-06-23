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
} from "@nestjs/swagger";
import { CreateLedgerDetailsDto } from "./dto/ledger_details_create";
import { LedgerDetailsService } from "./ledger_details_service";
import { LedgerDetails as customersEntity } from "./ledger_details";
import { LedgerDetailsDto } from "./dto/ledger_details_dto";
import { PageDto, PageOptionsDto } from "../shared/dto";
import { UpdateLedgerDetailsDto } from "./dto/ledger_details_update";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("ledger_details")
@ApiTags("Ledger Details")
@UseInterceptors(ErrorsInterceptor)
export class LedgerDetailsController {
  constructor(private readonly service: LedgerDetailsService) {}
  @Get("/list")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [LedgerDetailsDto] })
  findAllCustomer(): Promise<LedgerDetailsDto[]> {
    return this.service.findAllList();
  }
  @Get()
  @ApiOkResponse({ type: [LedgerDetailsDto] })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<LedgerDetailsDto>> {
    return this.service.findAll(pageOptionsDto);
  }

  @Get("/:adminid/:cname/:sdate/:ldate")
  @ApiOkResponse({ type: [LedgerDetailsDto] })
  async findAllInDateRange(
    @Param("adminid") adminid: number,
    @Param("cname") cname,
    @Param("sdate") sdate,
    @Param("ldate") ldate
  ): Promise<any> {
    return this.service.findAllInDateRange(adminid, cname, sdate, ldate);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: LedgerDetailsDto })
  @ApiParam({ name: "id", required: true })
  findOne(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.service.findOne(id);
  }

  @Get(":id/:adminid/:ledger")
  @ApiBearerAuth()
  @ApiOkResponse({ type: LedgerDetailsDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "ledger", required: true })
  findOneByCashId(
    @Param("id", ParseIntPipe) id: number,
    @Param("adminid", ParseIntPipe) adminid: number,
    @Param("ledger", ParseIntPipe) ledger: number
  ): Promise<any> {
    return this.service.findOneByCashId(id, adminid, ledger);
  }

  @Post()
  @ApiCreatedResponse({ type: customersEntity })
  @ApiBearerAuth()
  create(@Body() create: CreateLedgerDetailsDto): Promise<customersEntity> {
    return this.service.create(create);
  }

  @Put("/update_ledger/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: UpdateLedgerDetailsDto
  ): Promise<customersEntity> {
    return this.service.update(id, update);
  }

  @Put("/updateCashDeatails/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateCashDeatails(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: any
  ): Promise<customersEntity> {
    return this.service.updateCashDeatails(id, update);
  }

  @Put("/updateBankDetails/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateBankDetails(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: any
  ): Promise<customersEntity> {
    return this.service.updateBankDetails(id, update);
  }

  @Post("/updateContraVoucher/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateContraVoucher(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: any
  ): Promise<customersEntity> {
    return this.service.updateContraVoucher(id, update);
  }

  @Delete(":id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<customersEntity> {
    return this.service.delete(id);
  }

  @Delete("delateTransaction/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delateTransaction(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<customersEntity> {
    return this.service.delateTransaction(id);
  }

  @Put("update/:id")
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateBank(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: UpdateLedgerDetailsDto
  ): Promise<customersEntity> {
    return this.service.updateBank(id, update);
  }

  @Get("/delete/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: "id", required: true })
  Delete(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.service.Delete(id);
  }
}
