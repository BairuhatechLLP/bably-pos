import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { StaffTransactionsService } from "./staff_transactions_service";
import { StaffTransactionsDto } from "./dto/staff_transactions_dto";
import { CreateDto } from "./dto/staff_transactions_create.dto";
import { StaffTransactions } from "./staff_transactions_entity";
import { ListStaffTrancectionDto, TransactionListDto } from "./dto/staff_transactions.list-dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("StaffTransactions")
@ApiTags("StaffTransactions")
@UseInterceptors(ErrorsInterceptor)
export class StaffTransactionsController {
  constructor(private readonly service: StaffTransactionsService) { }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  findAll(): Promise<StaffTransactionsDto[]> {
    return this.service.findAll();
  }

  @Get("/getStaffTransaction/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  getLedgerById(
    @UserId() userId: number,
    @Param("id") id: any): Promise<CommonResponseDto> {
    return this.service.findOne(id, userId);
  }

  @Get("/completeTransactionList")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiQuery({name:"transactiontype",required:true})
  @ApiQuery({name:"sdate",required:false})
  @ApiQuery({name:"edate",required:false})
  @ApiQuery({name:"period",required:false})
  @ApiQuery({name:"companyId",required:true})
  @ApiQuery({name:"staffId",required:true})
  @ApiQuery({name:"page",required:false})
  @ApiQuery({name:"take",required:false})
  getCompleteTransactionList(
    @UserId() userId:number,
    @Query() query:TransactionListDto
  ) :Promise <CommonResponseDto> {
    return this.service.getCompleteTransactionList( userId,query);
  }


  @Post("add")
  @ApiCreatedResponse({ type: StaffTransactions })
  @ApiBearerAuth()
  create(@Body() createDto: CreateDto, @Req() request): Promise<any> {
    return this.service.create(createDto);
  }

  @Post("/list")
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  @ApiBearerAuth()
  list(
    @UserId() userId: number,
    @Body() create: ListStaffTrancectionDto): Promise<any> {
    return this.service.list(userId, create);
  }
  @Post("/listReport")
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  @ApiBearerAuth()
  reportPageList(
    @UserId() userId: number,
    @Body() create: ListStaffTrancectionDto): Promise<any> {
    return this.service.reportPageList(userId, create);
  }

  @Post("/getone")
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiBearerAuth()
  getOne(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.getOne(create, userId);
  }
  @Post("/getonepurchase")
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiBearerAuth()
  getOnePurchase(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.getOnePurchase(create, userId);
  }

  @Get("transactions/:adminid/:staffid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "customerid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getStaffStatement(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("staffid", new ParseIntPipe()) staffid: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<CommonResponseDto> {
    return this.service.transactionForChosenPeriod(
      adminid,
      staffid,
      sdate,
      ldate
    );
  }

  @Post("add/pymentcreatetoledeger")
  @ApiCreatedResponse({ type: StaffTransactions })
  @ApiBearerAuth()
  pymentCreateToLedeger(@Body() createDto: any, @Req() request): Promise<any> {
    return this.service.pymentCreateToLedeger(createDto);
  }

  @Put("update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: StaffTransactions })
  update(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: any
  ): Promise<any> {
    return this.service.update(id, userId, updateDto);
  }

  @Post("/list-by-shift")
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  @ApiBearerAuth()
  listByShift(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.listByShift(userId, create);
  }

  // @Get("/shift-report/:companyid/:")
  // @ApiOkResponse({ type: [StaffTransactionsDto] })
  // @ApiBearerAuth()
  //
  // shiftReport(@Body() create: any): Promise<any> {
  //   return this.service.shiftReport(create);
  // }
  @Post("/shift-report")
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  @ApiBearerAuth()
  shiftReport(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.shiftReport(userId, create);
  }
  @Post("/day-report")
  @ApiOkResponse({ type: [StaffTransactionsDto] })
  @ApiBearerAuth()
  dayReport(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.dayReport(userId, create);
  }

}
