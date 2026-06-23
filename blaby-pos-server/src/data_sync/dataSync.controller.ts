import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from "@nestjs/common";
import { ApiParam, ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DataSyncService } from "./datasync.services";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("end-of-year")
@ApiTags("END OF YEAR")
@UseInterceptors(ErrorsInterceptor)
export class DataSyncController {
  constructor(private readonly dataSyncService: DataSyncService) {}

  @Get("data-sync/:adminid")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  syncAll(@Param("adminid", new ParseIntPipe()) adminid: number): Promise<any> {
    return this.dataSyncService.syncDatas(adminid);
  }
  @Get("user-sync/:adminid")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  syncUser(
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<any> {
    return this.dataSyncService.syncUser(adminid);
  }
  @Get("settings-sync/:adminid/:companyId/:newAdminId/:newCompanyId")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  @ApiParam({ name: "companyId" })
  @ApiParam({ name: "newAdminId" })
  @ApiParam({ name: "newCompanyId" })
  syncSettings(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyId", new ParseIntPipe()) companyId: number,
    @Param("newAdminId", new ParseIntPipe()) newAdminId: number,
    @Param("newAdminId", new ParseIntPipe()) newCompanyId: number
  ): Promise<any> {
    return this.dataSyncService.syncSettings(
      adminid,
      companyId,
      newAdminId,
      newCompanyId
    );
  }
  @Get("accounts-sync/:adminid/:companyId/:newAdminId/:newCompanyId")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  @ApiParam({ name: "companyId" })
  @ApiParam({ name: "newAdminId" })
  @ApiParam({ name: "newCompanyId" })
  syncAccounts(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyId", new ParseIntPipe()) companyId: number,
    @Param("newAdminId", new ParseIntPipe()) newAdminId: number,
    @Param("newCompanyId", new ParseIntPipe()) newCompanyId: number
  ): Promise<any> {
    return this.dataSyncService.syncAccounts(
      adminid,
      companyId,
      newAdminId,
      newCompanyId
    );
  }
  @Get("products-sync/:adminid/:companyId/:newAdminId/:newCompanyId")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  @ApiParam({ name: "companyId" })
  @ApiParam({ name: "newAdminId" })
  @ApiParam({ name: "newCompanyId" })
  syncProducts(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyId", new ParseIntPipe()) companyId: number,
    @Param("newAdminId", new ParseIntPipe()) newAdminId: number,
    @Param("newCompanyId", new ParseIntPipe()) newCompanyId: number
  ): Promise<any> {
    return this.dataSyncService.syncProducts(
      adminid,
      companyId,
      newAdminId,
      newCompanyId
    );
  }
  @Get("contact-sync/:adminid/:companyId/:newAdminId/:newCompanyId")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: "adminid" })
  @ApiParam({ name: "companyId" })
  @ApiParam({ name: "newAdminId" })
  @ApiParam({ name: "newCompanyId" })
  syncContacts(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyId", new ParseIntPipe()) companyId: number,
    @Param("newAdminId", new ParseIntPipe()) newAdminId: number,
    @Param("newCompanyId", new ParseIntPipe()) newCompanyId: number
  ): Promise<any> {
    return this.dataSyncService.syncContacts(
      adminid,
      companyId,
      newAdminId,
      newCompanyId
    );
  }
}
