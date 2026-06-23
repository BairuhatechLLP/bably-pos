import { DataTransferLog } from "./datatranferlog.entity";

export const dataTransferLogProviders = [
  { provide: "dataTransferLogRepository", useValue: DataTransferLog },
];
