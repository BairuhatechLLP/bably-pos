import { RetailCustomerEntity } from "./retail_customer_entity";

export const RetailCustomerProvider = [
  { provide: "retailCustomerRepository", useValue: RetailCustomerEntity },
];
