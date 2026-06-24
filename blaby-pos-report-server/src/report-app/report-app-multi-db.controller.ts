import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportAppSequelizeService } from './report-app-sequelize.service';
import { ReportQueryDto } from './dto/query.dto';
import {
  StaffListQueryDto,
  StaffPerformanceQueryDto,
} from './dto/staff-query.dto';

@Controller('report_app')
export class ReportAppMultiDbController {
  constructor(private readonly reportAppService: ReportAppSequelizeService) {}

  // V2 endpoints - Multi-database filtered by companyId

  // Get list of database branches for filtering
  @Get('/v2/database_branches')
  async GetDatabaseBranches(): Promise<unknown> {
    return this.reportAppService.getDatabaseBranches();
  }

  // Diagnostic endpoint to check database data
  @Get('/v2/diagnostic')
  async GetDiagnostic(): Promise<unknown> {
    return this.reportAppService.diagnosticCheck();
  }

  @Get('/v2/home')
  async GetHome1(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Home1(pageOpt, companyId);
  }

  @Get('/v2/reports')
  async GetReport1(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Reports1(pageOpt, companyId);
  }

  @Get('/v2/branch_picker')
  async GetBranch_picker1(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.BranchePicker1(pageOpt, companyId);
  }

  @Get('/v2/branch')
  async GetBranch1(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Branches1(pageOpt, companyId);
  }

  @Get('/v2/branch_details/:id')
  async GetBranchDetails1(
    @Param('id', new ParseIntPipe()) id: number,
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Branch_details1(id, pageOpt, companyId);
  }

  @Get('/v2/products')
  async GetProducts1(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Products1(pageOpt, companyId);
  }

  // Export products as PDF
  @Get('/v2/products/export-pdf')
  async ExportProductsPDF(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId: number,
    @Res() res: Response,
  ): Promise<void> {
    return this.reportAppService.exportProductsPDF(pageOpt, companyId, res);
  }

  // Export products as HTML (for mobile browser)
  @Get('/v2/products/export')
  async ExportProductsHTML(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId: number,
    @Res() res: Response,
  ): Promise<void> {
    return this.reportAppService.exportProductsHTML(pageOpt, companyId, res);
  }

  // Category-wise products report with totals per category
  @Get('/v2/products/category-wise')
  async GetProductsCategoryWise(
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.ProductsCategoryWise(pageOpt, companyId);
  }

  @Get('/v2/product_details/:id')
  async GetProductDetails2(
    @Param('id', new ParseIntPipe()) id: number,
    @Query() pageOpt: ReportQueryDto,
    @Query('companyId') companyId?: number,
  ): Promise<unknown> {
    return this.reportAppService.Product_details1(id, pageOpt, companyId);
  }

  // STAFF ENDPOINTS

  // Get list of staff who took orders in a specific branch
  @Get('/v2/staff/list')
  async GetStaffList(@Query() query: StaffListQueryDto): Promise<unknown> {
    return this.reportAppService.getStaffList(query.companyId);
  }

  // Get detailed performance for a specific staff member
  @Get('/v2/staff/performance')
  async GetStaffPerformance(
    @Query() query: StaffPerformanceQueryDto,
  ): Promise<unknown> {
    return this.reportAppService.getStaffPerformance(
      query.companyId,
      query.staffId,
      query.filter,
      query.startDate,
      query.endDate,
    );
  }

  // Get all products ordered by a specific staff member
  @Get('/v2/staff/products')
  async GetStaffProducts(
    @Query() query: StaffPerformanceQueryDto,
  ): Promise<unknown> {
    return this.reportAppService.getStaffProducts(
      query.companyId,
      query.staffId,
      query.filter,
      query.startDate,
      query.endDate,
      query.page,
      query.pageSize,
      query.limit,
    );
  }

  // Diagnostic endpoint to check table structure
  @Get('/v2/staff/diagnostic')
  async GetStaffDiagnostic(
    @Query('companyId') companyId: number,
  ): Promise<unknown> {
    return this.reportAppService.getStaffDiagnostic(companyId);
  }
}
