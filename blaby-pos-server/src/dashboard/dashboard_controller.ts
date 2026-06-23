import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { DashboardService } from "./dashboard_service";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";

@Controller("dashboard")
@ApiTags("Dashboard")
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Post("/customData")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  getCustomData(
    @Body() customData: any,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.getCustomData(
      customData.adminid,
      customData.sdate,
      customData.companyid
    );
  }

  @Post("/graphData")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  getGraphData(
    @Body() graphData: any,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.getGraphData(
      graphData.adminid,
      graphData.sdate,
      graphData.ldate,
      graphData.companyid
    );
  }
  @Get("/userGraphData")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  getUserGraphData(): Promise<CommonResponseDto> {
    return this.service.getUserGraphData();
  }

  @Get("staffData/:staffid")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  @ApiParam({ name: "staffid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  staffActivityData(
    @Param("staffid", new ParseIntPipe()) staffid: number
  ): Promise<CommonResponseDto> {
    return this.service.staffActivityData(staffid);
  }


}
