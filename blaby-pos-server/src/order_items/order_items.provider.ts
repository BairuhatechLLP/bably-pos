import { OrderItems } from "./order_items.entity";

export const orderItemsProviders = [
  { provide: "OrderItemsRepository", useValue: OrderItems },
];
