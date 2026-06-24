import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  OrderBranchOnlyQueryDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('report_app/v2/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * DIAGNOSTIC — what adminId/staffId/displays does the report-server resolve
   * for a branch? Use this to confirm the values that would land on a new order
   * match what the KDS expects. Read-only, safe to call repeatedly.
   * GET /report_app/v2/orders/_diagnose?branchId=158
   *
   * TEMPORARILY UNGUARDED for debugging — re-add @UseGuards(JwtAuthGuard) after.
   */
  @Get('_diagnose')
  async diagnose(@Query(ValidationPipe) query: OrderBranchOnlyQueryDto) {
    return this.orderService.diagnose(query.branchId);
  }

  /**
   * Create a new order in a given branch
   * POST /report_app/v2/orders?branchId=158
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Query(ValidationPipe) query: OrderBranchOnlyQueryDto,
    @Body(ValidationPipe) body: CreateOrderDto,
  ) {
    return this.orderService.createOrder(query.branchId, body);
  }

  /**
   * Update an existing order
   * PUT /report_app/v2/orders/:id?branchId=158
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: OrderBranchOnlyQueryDto,
    @Body(ValidationPipe) body: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, query.branchId, body);
  }

  /**
   * Cancel an order
   * POST /report_app/v2/orders/:id/cancel?branchId=158
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: OrderBranchOnlyQueryDto,
  ) {
    return this.orderService.cancelOrder(id, query.branchId);
  }

  /**
   * Recent orders for a branch (last N days, default 3)
   * GET /report_app/v2/orders?branchId=158&days=3
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async listRecentOrders(@Query(ValidationPipe) query: OrderQueryDto) {
    return this.orderService.listRecentOrders(query.branchId, query.days ?? 3);
  }

  /**
   * Get a single order by id
   * GET /report_app/v2/orders/:id?branchId=158
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: OrderBranchOnlyQueryDto,
  ) {
    return this.orderService.getOrderById(id, query.branchId);
  }
}
