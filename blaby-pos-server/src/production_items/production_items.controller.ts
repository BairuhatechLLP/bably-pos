import {
  Controller,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
} from "@nestjs/swagger";

import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { ProductionItemsService } from "./production_items.service";

@Controller("production_items")
@ApiTags("production_items")
@UseInterceptors(ErrorsInterceptor)
export class ProductionItemsController {
  constructor(private readonly productionItemsService: ProductionItemsService) {}
}
