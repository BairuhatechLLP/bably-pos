import { ProductionItems } from "./production_items.entity";




export const ProductionItemsProviders = [
  { provide: "ProductionItemsRepository", useValue: ProductionItems },
];
