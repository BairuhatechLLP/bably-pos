import { DatabaseModule } from "../database/database.module";
import { Module } from "@nestjs/common";
import { AuditLogService } from "./audit_log_service";
import { AuditLoggingService } from "./audit_logging_service";
import { AuditLogProviders } from "./audit_log_providers";

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    AuditLogService,
    AuditLoggingService,
    ...AuditLogProviders,
  ],
  exports: [AuditLogService, AuditLoggingService],
})
export class AuditLogModule {}
