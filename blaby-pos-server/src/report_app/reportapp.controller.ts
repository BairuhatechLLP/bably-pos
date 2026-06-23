import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../shared/decorators/public.decorator";
import { CommonResponseDto } from "../shared/dto/common-response.dto";

import { ReportAppService } from "./reportapp.service";
import { ReportQueryDto } from "./dto/query.dto";
import { UserId } from "../shared/decorators/userId_decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("report_app")
@ApiTags("Report_app")
@UseInterceptors(ErrorsInterceptor)
export class ReportAppController {
  constructor(private readonly reportAppService: ReportAppService) {}

  @Get("/home")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetHome(@Query() pageOpt: any): Promise<unknown> {
    return this.reportAppService.Home(pageOpt);
  }

  @Get("/v2/home")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetHome1(
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Home1(pageOpt, userId);
  }

  @Get("/reports")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetReport(@Query() pageOpt: any): Promise<unknown> {
    return this.reportAppService.Reports(pageOpt);
  }

  @Get("/v2/reports")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetReport1(
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Reports1(pageOpt, userId);
  }

  @Get("/branch_picker")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranch_picker(@Query() pageOpt: any): Promise<unknown> {
    return this.reportAppService.BranchePicker(pageOpt);
  }

  @Get("/v2/branch_picker")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranch_picker1(
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.BranchePicker1(pageOpt, userId);
  }

  @Get("/branch")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranch(@Query() pageOpt: any): Promise<unknown> {
    return this.reportAppService.Branches(pageOpt);
  }

  @Get("/v2/branch")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranch1(
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Branches1(pageOpt, userId);
  }

  @Get("/branch_details/:id")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranchDetails(
    @Param("id", new ParseIntPipe()) id: number,
    @Query() pageOpt: any
  ): Promise<unknown> {
    return this.reportAppService.Branch_details(id, pageOpt);
  }

  @Get("/v2/branch_details/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetBranchDetails1(
    @Param("id", new ParseIntPipe()) id: number,
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Branch_details1(id, pageOpt, userId);
  }

  @Get("/products")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetProducts(@Query() pageOpt: any): Promise<unknown> {
    return this.reportAppService.Products(pageOpt);
  }

  @Get("/v2/products")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetProducts1(
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Products1(pageOpt, userId);
  }

  @Get("/product_details/:id")
  @Public()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetProductDetails(
    @Param("id", new ParseIntPipe()) id: number,
    @Query() pageOpt: any
  ): Promise<unknown> {
    return this.reportAppService.Product_details(id, pageOpt);
  }

  @Get("/v2/product_details/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetProductDetails2(
    @Param("id", new ParseIntPipe()) id: number,
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.Product_details1(id, pageOpt, userId);
  }

  @Get("/v2/product_sale_history/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetProductSaleHistory(
    @Param("id", new ParseIntPipe()) id: number,
    @Query() pageOpt: ReportQueryDto,
    @UserId() userId: number
  ): Promise<unknown> {
    return this.reportAppService.ProductSaleHistory(id, pageOpt, userId);
  }
}
