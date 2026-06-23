import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
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
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StripeLogService } from "./stripe_log.service";
import { UpdateStripeLogDto } from "./dto/update_stripe_log.dto";
import { CreateStripeLogDto } from "./dto/create_stripe_log.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";

@Controller("stripe_log")
@ApiTags("Stripe_Log")
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
export class StripeLogController {
  constructor(private readonly StripeLogService: StripeLogService) {}

  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(): Promise<CommonResponseDto> {
    return this.StripeLogService.findAll();
  }

  @Get("/user-log")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  findSubscriptionByAdminid(
    @UserId() userId: number,
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.findSubscriptionByAdminid(userId);
  }

  @Get("/list/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  findAllByCompany(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.findAllByCompany(adminid, companyid);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse()
  @ApiBearerAuth()
  create(
    @Body() CreateStripeLogDto: CreateStripeLogDto
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.create(CreateStripeLogDto);
  }
  
  @Post("subscription")
  @ApiCreatedResponse()
  @ApiBearerAuth()
  createSubscription(
    @Body() CreateStripeLogDto: any
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.createSubscription(CreateStripeLogDto);
  }

  @Post("/paymentApproval/:id")
  @ApiCreatedResponse()
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  paymentApproval(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: any
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.paymentApproval(id, updateDto);
  }

  @Put(":id")
  @ApiOkResponse()
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request,
    @Body() UpdateStripeLogDto: UpdateStripeLogDto
  ): Promise<CommonResponseDto> {
    return this.StripeLogService.update(id, UpdateStripeLogDto);
  }

  @Delete(":id")
  @ApiOkResponse()
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request
  ): Promise<any> {
    return this.StripeLogService.delete(id);
  }
}
