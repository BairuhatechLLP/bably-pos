import { BomItems } from "./bom_items.entity";

export const BomItemsProviders = [
  { provide: "BomItemsRepository", useValue: BomItems },
];
