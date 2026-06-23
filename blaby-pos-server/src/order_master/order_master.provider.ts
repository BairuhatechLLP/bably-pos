import { OrderMaster } from "./order_master.entity";

export const orderMasterProviders = [
  { provide: "OrderMasterRepository", useValue: OrderMaster },
];
