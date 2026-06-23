import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { AuditLogService } from "./audit_log_service";

@Injectable()
export class AuditLoggingService implements NestMiddleware {
  constructor(private readonly auditLogService: AuditLogService) {}

  async use(req: any, res: any, next: NextFunction) {
    if (req.method !== 'GET') {
    let send = res.send;
    res.send = (exitData) => {
      if (
        res?.getHeader("content-type")?.toString().includes("application/json")
      ) {
        let responseData;
        if (
          typeof exitData.toString() === "string" &&
          exitData.toString().trim() !== ""
        ) {
          try {
            responseData = JSON.parse(exitData.toString());
          } catch (err) {
            console.log(err);
          }
        }
        
        const audit_log = {
          adminid: req.userId ?  req.userId : -2, // -2 for public requests
          userid: req.body.createdBy ? req.body.createdBy : req.userId ? req.userId : -2,
          method: req.method,
          url: req.originalUrl,
          params: req.params ? req.params : "",
          status: res.statusCode,
          request: req.body,
          response: responseData,
        };
         this.auditLogService.create(audit_log);
      }
      res.send = send;
      return res.send(exitData);
    };
  }
    next();
  }
}
