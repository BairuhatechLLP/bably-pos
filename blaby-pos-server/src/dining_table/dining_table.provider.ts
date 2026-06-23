import { DiningTable } from "./dining_table.entity";

export const DiningTableProvider = [
  { provide: "DiningTableRepository", useValue: DiningTable },
];
