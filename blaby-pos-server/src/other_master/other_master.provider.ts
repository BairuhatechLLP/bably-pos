import { OtherMaster } from "./other_master.entity";

export const OtherMasterProvider = [
  { provide: "OtherMasterRepository", useValue: OtherMaster },
];
