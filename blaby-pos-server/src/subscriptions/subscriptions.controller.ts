import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";
import { UserId } from "../shared/decorators/userId_decorator";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { GetPricingDto } from "./dto/subscription.pricing.dto";
import { CreateSubscriptionsDto } from "./dto/subscriptions.create.dto";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
@ApiTags("subscriptions")
export class SubscriptionsController {
  constructor(private readonly SubscriptionsService: SubscriptionsService) {}

  @Get("getprice")
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(200)
  findOne(
    @UserId() userId:number,
    @Query() data: GetPricingDto
  ): Promise<CommonResponseDto> {
    return this.SubscriptionsService.getPriceDetails(userId,data);
  }

  @Get("getUserPlan")
  @HttpCode(200)
  findSubscribedPlan(
    @UserId() userId: number,
  ): Promise<CommonResponseDto> {
    return this.SubscriptionsService.findOne(userId);
  }

  @Post("subscribe")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @HttpCode(201)
  subscribePlan(
    @Body() create: CreateSubscriptionsDto
  ): Promise<CommonResponseDto> {
    return this.SubscriptionsService.subscribeToPlan(create);
  }

  @Post("addon")
  @ApiBearerAuth()
  @HttpCode(201)
  addOn(@Body() create: CreateSubscriptionsDto): Promise<CommonResponseDto> {
    return this.SubscriptionsService.addOn(create);
  }
}
