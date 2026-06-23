import { AuditLog } from "./audit_log_entity";

export const AuditLogProviders = [
  { provide: "AuditLogRepository", useValue: AuditLog },
];
