import { ProductionMaster } from "./production_master.entity";



export const ProductionMasterProviders = [
  { provide: "ProductionMasterRepository", useValue: ProductionMaster },
];
