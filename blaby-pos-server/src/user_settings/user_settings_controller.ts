import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UserSettings } from "./user_settings_entity";
import { UserSettingsService } from "./user_settings_service";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("user_settings")
@ApiTags("User Settings")
@UseInterceptors(ErrorsInterceptor)
export class UserSettingsController {
  constructor(private readonly service: UserSettingsService) {}

  @Post("/createInvoiceNoConfig/:adminid/:companyid/:loactionId")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBody({})
  create(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
    @Body() createDto: any
  ): Promise<CommonResponseDto> {
    return this.service.create(adminid, companyid,loactionId, createDto);
  }

  @Get("/invoiceNoConfig/:adminid/:companyid/:loactionId")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiOkResponse({ type: UserSettings })
  findAll(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
  ): Promise<UserSettings> {
    return this.service.findAllInvoiceNoConfig(adminid, companyid,loactionId);
  }

  @Put("/updateInvoiceNoConfig/:adminid/:loactionId")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBody({})
  update(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
    @Body() updateDto: any
  ): Promise<CommonResponseDto> {
    return this.service.updateById(adminid,loactionId, updateDto);
  }

  @Put("updateInvoiceConfig/:adminid/:companyid/:loactionId")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiOkResponse({ type: UserSettings })
  @ApiBody({})
  updateInvoiceConfig(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
    @Body() updatedValues: any
  ): Promise<UserSettings> {
    return this.service.updateInvoiceConfig(adminid, companyid,loactionId, updatedValues);
  }

  @Put("/updateLastInvoiceNo/:adminid/:companyid/:loactionId/:type")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBody({})
  updateLastInvoiceNo(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.service.updateLastInvoiceNo(adminid,companyid,loactionId, type);
  }

  @Get("/getInvoiceNo/:id/:companyid/:loactionId/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "loactionId", required: true })
  @ApiParam({ name: "type", required: true })
  getInvoiceNo(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("loactionId", new ParseIntPipe()) loactionId: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.service.getInvoiceNo(id, companyid,loactionId, type);
  }
}
