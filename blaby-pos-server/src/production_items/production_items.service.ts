import {
  Inject,
  Injectable,
} from "@nestjs/common";
import { ProductionItems } from "./production_items.entity";


@Injectable()
export class ProductionItemsService {
  constructor(
    @Inject("ProductionItemsRepository")
    private readonly productionItemsRepository: typeof ProductionItems,
  ) {}
}
