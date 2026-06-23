import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ReportService } from "./report.service";
import { VatReportService } from "./vatReport.service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { BalanceSheetService } from "./balanceSheet.service";
import { StockSummaryService } from "./stockSummary.service";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { DayReportService } from "./dayReport.service";
import { UserId } from "../shared/decorators/userId_decorator";

@Controller("report")
@ApiTags("Report")
@UseInterceptors(ErrorsInterceptor)
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly vatReportService: VatReportService,
    private readonly balanceSheetService: BalanceSheetService,
    private readonly stockSummaryService: StockSummaryService,
    private readonly dayReportService: DayReportService
  ) {}

  @Get("/trialbalance/:adminid/:companyid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  trailBalance(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("sdate") sdate: string,
    @Param("ldate") ldate: string
  ): Promise<CommonResponseDto> {
    return this.reportService.trialbalanceForPeriod(
      adminid,
      sdate,
      ldate,
      companyid
    );
  }

  @Post("/balancesheet")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  balancesheet(@Body() data: any): any {
    return this.balanceSheetService.report(data);
  }

  @Get("/profitLoss/:adminid/:companyid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  profitLoss(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("sdate") sdate: string,
    @Param("ldate") ldate: string
  ): Promise<CommonResponseDto> {
    return this.reportService.profitLossCalc(adminid, sdate, ldate, companyid);
  }

  @Post("/saveviewemail")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  saveviewemail(@Body() invoiceData: any): Promise<CommonResponseDto> {
    return this.reportService.saveviewemail(invoiceData);
  }

  @Post("/saveviewemailPurchase")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  saveviewemailPurchase(@Body() invoiceData: any): Promise<CommonResponseDto> {
    return this.reportService.saveViewePurchasEmail(invoiceData);
  }

  @Get("agedcreditors/:adminid/:sdate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async agedcreditors(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("sdate") sdate: string
  ): Promise<CommonResponseDto> {
    return this.reportService.agedcreditors(adminid, sdate);
  }

  @Get("agedcreditors2/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async agedcreditors2(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.reportService.agedcreditors2(adminid, companyid);
  }

  @Get("agedebtors/:adminid/:sdate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async agedebtors(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("sdate") sdate: string
  ): Promise<CommonResponseDto> {
    return this.reportService.agedebtors(adminid, sdate);
  }

  @Get("agedebtors2/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async agedebtors2(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.reportService.agedebtors2(adminid, companyid);
  }

  @Get("nominalagecreditors/:adminid/:fdate/:ldate/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async nominalagecreditors(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string,
    @Param("id") id: string
  ): Promise<CommonResponseDto> {
    return this.reportService.nominalagecreditors(adminid, fdate, ldate, id);
  }
  @Get("nominalagedebtors/:adminid/:fdate/:ldate/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async nominalagedebtors(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string,
    @Param("id") id: string
  ): Promise<CommonResponseDto> {
    return this.reportService.nominalagedebtors(adminid, fdate, ldate, id);
  }

  @Get("getVatNominalList/:adminid/:companyid/:id/:fdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getVatNominalList(
    @Req() request,
    @Param("adminid") adminid: number,
    @Param("companyid") companyid: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string,
    @Param("id") id: string
  ): Promise<CommonResponseDto> {
    return this.vatReportService.getVatNominalList(
      id,
      adminid,
      companyid,
      fdate,
      ldate
    );
  }

  @Get("getNominalVat/:adminid/:companyid/:id/:ledger/:fdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "ledger", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getNominalVat(
    @Req() request,
    @Param("adminid") adminid: number,
    @Param("companyid") companyid: number,
    @Param("ledger") ledger: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string,
    @Param("id") id: number
  ): Promise<CommonResponseDto> {
    return this.vatReportService.getNominalVat(
      adminid,
      companyid,
      id,
      ledger,
      fdate,
      ldate
    );
  }

  @Get("overallVatReport/:userid/:companyid/:fdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "userid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async overallVatReport(
    @Req() request,
    @Param("userid", new ParseIntPipe()) userid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string
  ): Promise<CommonResponseDto> {
    return this.vatReportService.overallVatReport(
      userid,
      companyid,
      fdate,
      ldate
    );
  }

  //Stock Summary
  @Get("/user/list/type/:id/:companyid/:fdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "fdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  findAllStock(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("fdate") fdate: string,
    @Param("ldate") ldate: string
  ): Promise<any> {
    return this.stockSummaryService.getAllStockData(id, companyid,fdate, ldate);
  }

  //dayReport
  @Get("/dayReport")
  @ApiBearerAuth()
  // @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  dayReport(@Query() query: any, @UserId() userId: number): Promise<any> {
    return this.dayReportService.statementListBy(
      userId,
      query?.companyid,
      query?.sdate,
      query?.ldate
    );
  }

  //dayReport
  @Get("/dayReport/totalsummary")
  @ApiBearerAuth()
  // @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  dayTotalReport(@Query() query: any, @UserId() userId: number): Promise<any> {
    return this.dayReportService.dayTotalReport(
      userId,
      query?.companyid,
      query?.sdate,
      query?.ldate,
      query?.page,
      query?.limit
    );
  }

  //Day Report new
  @Get("/dayReportSummary")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  dayBookReport(@Query() query: any, @UserId() userId: number): Promise<any> {
    return this.dayReportService.dayBookReport(
      userId,
      query?.companyid,
      query?.sdate,
      query?.ldate
    );
  }
  // < ------ new api JIS --------
  @Get("/inward/:adminid/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "id", required: true })
  productDetails(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<any> {
    return this.stockSummaryService.inwardData(adminid, id);
  }

  @Get("/outward/:adminid/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "id", required: true })
  product2Details(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<any> {
    return this.stockSummaryService.outwardData(adminid, id);
  }
  // --------- new api JIS -------->

  @Get("/ledger-details/:id/:companyid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "sdate", required: true })
  @ApiParam({ name: "ldate", required: true })
  ledgerDetails(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("sdate") sdate: string,
    @Param("ldate") ldate: string
  ): Promise<CommonResponseDto> {
    return this.reportService.getLedgerDetails(id, companyid, sdate, ldate);
  }

  @Get("staffAnalysis/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async staffReport(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.reportService.staffReport(adminid, companyid);
  }

  @Get("hsnReport/:companyid/:hsnCode")
  @ApiBearerAuth()
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "hsnCode", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async HsnCodeReport(
    @Req() request,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("hsnCode") hsnCode: string
  ): Promise<any> {
    return this.reportService.HsnCodeReport(companyid, hsnCode);
  }

  @Get("categoryByCompany")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  async categoryByCompanyReport(
    @Query() query: any,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.reportService.productCategoryByCompanyReport(
      userId,
      query?.categoryId ? parseInt(query.categoryId) : undefined,
      query?.categoryName,
      query?.startDate,
      query?.endDate,
      query?.companyId ? parseInt(query.companyId) : undefined
    );
  }

  @Get("categorySales")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  async categorySalesReport(
    @Query() query: any,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.reportService.categorySalesForUser(
      userId,
      query?.categoryName,
      query?.startDate,
      query?.endDate,
      query?.companyId ? parseInt(query.companyId) : undefined,
      query?.dateFilter
    );
  }
}
