import { KitchenDisplay } from "./kitchen_display.entity";

export const KitchenDisplayProviders = [
  { provide: "KitchenDisplayRepository", useValue: KitchenDisplay },
];