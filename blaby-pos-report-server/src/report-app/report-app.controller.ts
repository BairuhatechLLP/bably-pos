import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ReportAppService } from './report-app.service';

@Controller('report_app/v2')
export class ReportAppController {
  constructor(private readonly reportAppService: ReportAppService) {}

  // GET /report_app/v2/home
  @Get('home')
  async getHomeData() {
    return this.reportAppService.getHomeData();
  }

  // GET /report_app/v2/reports
  @Get('reports')
  async getReports(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportAppService.getReports(type, startDate, endDate);
  }

  // GET /report_app/v2/branch_picker
  @Get('branch_picker')
  async getBranchPicker() {
    return this.reportAppService.getBranchPicker();
  }

  // GET /report_app/v2/branch
  @Get('branch')
  async getBranches() {
    return this.reportAppService.getBranches();
  }

  // GET /report_app/v2/branch_details/:id
  @Get('branch_details/:id')
  async getBranchDetails(@Param('id', ParseIntPipe) id: number) {
    return this.reportAppService.getBranchDetails(id);
  }

  // GET /report_app/v2/products
  @Get('products')
  async getProducts(@Query('branchId') branchId?: string) {
    const parsedBranchId = branchId ? parseInt(branchId) : undefined;
    return this.reportAppService.getProducts(parsedBranchId);
  }

  // GET /report_app/v2/product_details/:id
  @Get('product_details/:id')
  async getProductDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('branchId') branchId?: string,
  ) {
    const parsedBranchId = branchId ? parseInt(branchId) : undefined;
    return this.reportAppService.getProductDetails(id, parsedBranchId);
  }
}
