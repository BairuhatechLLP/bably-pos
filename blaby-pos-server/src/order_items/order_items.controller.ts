import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OrderItemsService } from "./order_items.service";

@Controller('order_items')
@ApiTags('order_items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) { }}