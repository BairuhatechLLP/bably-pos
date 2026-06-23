import { Injectable, Inject } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { AuditLog } from "./audit_log_entity";

@Injectable()
export class AuditLogService {
  constructor(
    @Inject("AuditLogRepository")
    private readonly auditLogRepository: typeof AuditLog
  ) {}

  async create(auditdata) {
    try {
      const auditLog = await this.auditLogRepository.create<AuditLog>(
        auditdata
      );
      if (auditLog) {
        return new CommonResponseDto(
          auditLog,
          true,
          "Audit Log created successfully."
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Error in creating Audit Log."
        );
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
