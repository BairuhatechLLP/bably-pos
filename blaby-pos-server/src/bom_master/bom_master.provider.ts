import { BomMaster } from "./bom_master.entity";


export const BomMasterProviders = [
  { provide: "BomMasterRepository", useValue: BomMaster },
];
