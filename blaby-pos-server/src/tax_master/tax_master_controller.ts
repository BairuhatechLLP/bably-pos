import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  Req,
  Put,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateTaxMasterDto } from "./dto/create_tax_master";
import { UpdateTaxMasterDto } from "./dto/update_tax_master";
import { TaxService } from "./tax_master_service";
import { TaxDto } from "./dto/tax_master_dto";
import { PageOptionsDto } from "../shared/dto";
import { Tax as taxEntity } from "./tax_master_entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("tax_master")
@ApiTags("Tax Master")
@UseInterceptors(ErrorsInterceptor)
export class TaxController {
  constructor(private readonly service: TaxService) {}
  @Get("/:adminid/all")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiOkResponse({ type: [TaxDto] })
  findAllAirline(
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<TaxDto[]> {
    return this.service.findAll(adminid);
  }

  @Get("/list/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: [TaxDto] })
  findAllByCompany(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.findAllByCompany(adminid, companyid);
  }

  @Get("/list/:countryId")
  @ApiBearerAuth()
  @ApiParam({ name: "countryId", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(
    @Param("countryId", new ParseIntPipe()) countryId: number
  ): Promise<CommonResponseDto> {
    return this.service.findAllByCountryId(countryId);
  }
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [TaxDto] })
  findAllPage(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPage(pageOptionsDto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: TaxDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<TaxDto> {
    return this.service.getOne(id);
  }

  @Post("/add")
  @ApiCreatedResponse({ type: taxEntity })
  @ApiBearerAuth()
  create(
    @Body() CreateDto: CreateTaxMasterDto,
    @Req() request
  ): Promise<taxEntity> {
    return this.service.create(CreateDto);
  }

  @Put(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: taxEntity })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateTaxMasterDto
  ): Promise<TaxDto> {
    return this.service.update(id, updateDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: TaxDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<TaxDto> {
    return this.service.delete(id);
  }
}
