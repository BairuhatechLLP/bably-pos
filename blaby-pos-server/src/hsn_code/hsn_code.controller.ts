import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { HsnCodeService } from "./hsn_code.service";
import { UpdateHsnCodeDto } from "./dto/update_hsn_code.dto";
import { CreateHsnCodeDto } from "./dto/create_hsn_code.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("hsn_code")
@ApiTags("HSN_Code")
@UseInterceptors(ErrorsInterceptor)
export class HsnCodeController {
  constructor(private readonly HsnCodeService: HsnCodeService) {}

  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  findAll(): Promise<CommonResponseDto> {
    return this.HsnCodeService.findAll();
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.HsnCodeService.findOne(id);
  }

  @Get("list/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  findListByCompany(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.HsnCodeService.findListByCompany(adminid, companyid);
  }

  @Post()
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateHsnCodeDto: CreateHsnCodeDto
  ): Promise<CommonResponseDto> {
    return this.HsnCodeService.create(CreateHsnCodeDto);
  }

  @Put(":id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request,
    @Body() UpdateHsnCodeDto: UpdateHsnCodeDto
  ): Promise<CommonResponseDto> {
    return this.HsnCodeService.update(id, UpdateHsnCodeDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.HsnCodeService.delete(id);
  }
}
