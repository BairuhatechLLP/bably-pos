import { Controller, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { BomItemsService } from "./bom_items.service";

@Controller("bom_items")
@ApiTags("bom_items")
@UseInterceptors(ErrorsInterceptor)
export class BomItemsController {
  constructor(private readonly bomItemsService: BomItemsService) {}
}
