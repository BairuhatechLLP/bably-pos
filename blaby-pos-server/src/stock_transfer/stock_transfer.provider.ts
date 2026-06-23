import { StockTransfer } from "./stock_transfer.entity";

export const stockTransfer = [
  { provide: 'StockTransferRepository', useValue: StockTransfer },
];
