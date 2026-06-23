import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../shared/decorators/public.decorator";

import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { OrderDto } from "./dto/order.dto";

import { PosAppService } from "./posapp.service";
import { Data } from "./dto/query.dto";

@Controller("pos_app")
@ApiTags("Pos_app")
@Public()
export class PosAppController {
  constructor(private readonly posAppService: PosAppService) {}

  @Get("/orders")
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetOrders(@Query() pageOpt: Data): Promise<unknown> {
    return this.posAppService.orderList(pageOpt);
  }

  @Get("/order_statics")
  @ApiOkResponse({ type: [CommonResponseDto] })
  GetStatics(@Query() pageOpt: any): Promise<unknown> {
    return this.posAppService.orderStatics(pageOpt);
  }

  @Post("/create_order")
  @ApiOkResponse({ type: [CommonResponseDto] })
  CreateOrder(@Body() create: OrderDto): Promise<unknown> {
    return this.posAppService.createOrder(create);
  }

  @Put("/update_order")
  @ApiOkResponse({ type: [CommonResponseDto] })
  UpdateOrder(@Body() create: OrderDto): Promise<unknown> {
    return this.posAppService.updateOrder(create);
  }

  @Get("/order_status")
  @ApiOkResponse({ type: [CommonResponseDto] })
  UpdateOrderStatus(@Query() pageOpt: any): any {
    return this.posAppService.updateStatus(pageOpt);
  }

  @Get("/update_payment_method")
  @ApiOkResponse({ type: [CommonResponseDto] })
  UpdatePaymentMethod(@Query() pageOpt: any): any {
    return this.posAppService.updatePaymentMethod(pageOpt);
  }

  @Post("/sync_order")
  @ApiOkResponse({ type: [CommonResponseDto] })
  SyncOrder(@Body() create: OrderDto): Promise<unknown> {
    return this.posAppService.syncOrders(create);
  }
}
