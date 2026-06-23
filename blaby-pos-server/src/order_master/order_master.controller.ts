import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { OrderMasterService } from "./order_master.service";
import { OrderMaster } from "./order_master.entity";
import { CreateOrderDto } from "./dto/createOrder.dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UpdateOrderByStatusDto, UpdateOrderDto } from "./dto/updateOrder.dto";
import { UserId } from "../shared/decorators/userId_decorator";
import { OrderPageOptionsDto, getOrderQueryDto } from "./dto/orderMaster.dto";
import { OrderRetailQueryDto } from "./dto/orderRetailQuery.dto";
import { OrderReportQueryDto } from "./dto/orderReportQuery.dto";
import { OrderPaymentDto } from "./dto/updateBill.dto";

@Controller("order_master")
@ApiTags("order_master")
@UseInterceptors(ErrorsInterceptor)
export class OrderMasterController {
  constructor(private readonly orderMasterService: OrderMasterService) {}

  @Post("/create")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiCreatedResponse({ type: OrderMaster })
  @HttpCode(201)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  create(
    @UserId() userId: number,
    @Body() create: CreateOrderDto
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.create(create, userId);
  }

  @Get("getAllOrderCompany")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findAllOrderCompany(
    @UserId() userId: number,
    @Query() queryData: getOrderQueryDto,
    @Query() pageOptions:OrderPageOptionsDto,
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.findAllOrderCompany(queryData, userId,pageOptions);
  }

  @Get("getAllOrderRetail")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findAllOrderRetail(
    @UserId() userId: number,
    @Query("companyId") companyId: string,
    @Query() queryData: OrderRetailQueryDto
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.findAllOrderRetail(
      queryData,
      userId,
      companyId
    );
  }

  @Get(":id")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findOne(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.findOne(id, userId);
  }

  @Put("update_status")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OrderMaster })
  @HttpCode(201)
  updateStatus(
    @Body() body: UpdateOrderByStatusDto,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.updateOrderByStatus(body, userId);
  }
  @Put("update")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OrderMaster })
  @HttpCode(201)
  update(
    @Body() create: UpdateOrderDto,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.update(create, userId);
  }

  @Put("update-bill")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OrderMaster })
  @HttpCode(201)
  updateBill(
    @Body() create: OrderPaymentDto,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.updateBill(create, userId);
  }

  @Get("report/:companyId")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  orderReport(
    @Param("companyId", new ParseIntPipe()) companyId: number,
    @Query() queryData: OrderReportQueryDto
  ): Promise<CommonResponseDto> {
    return this.orderMasterService.generateReport(
      companyId,
      queryData
    );
  }

  @Get("test/whatsapp/1")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  sendWhatsappReport(): Promise<any> {
    return this.orderMasterService.sendWhatsappReport();
  }
}
