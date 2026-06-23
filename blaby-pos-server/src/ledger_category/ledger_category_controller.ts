import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiQuery,
} from "@nestjs/swagger";

import { LedgerCategoryService } from "./ledger_category_service";
import { LedgerCategory as cartEntity } from "./ledger_category_model";
import { LedgerCategoryDto } from "./dto/ledger_category_dto";
import { UpdateLedgerCategoryDto } from "./dto/ledger_category_update_dto";
import { CreateLedgerCategoryDto } from "./dto/ledger_category_create_dto";
import { PageOptionsDto } from "./../shared/dto";
import { CommonResponseDto } from "./../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("ledgercategory")
@ApiTags("Ledgercategory")
@UseInterceptors(ErrorsInterceptor)
export class LedgerCategoryController {
  constructor(private readonly service: LedgerCategoryService) {}
  @Get("all")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [LedgerCategoryDto] })
  findAllAirline(): Promise<LedgerCategoryDto[]> {
    return this.service.findAll();
  }
  @Get("/searchList/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiQuery({ name: "name", required: false })
  @ApiOkResponse({ type: LedgerCategoryDto })
  findAllAirlinee(
    @Param("id", new ParseIntPipe()) id: number,
    @Query("name") name: string
  ): Promise<any> {
    return this.service.search(id, name);
  }

  @Get("defaultLedgerCategory")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  defaultLedgerCategory(): Promise<CommonResponseDto> {
    return this.service.defaultLedgerCategory();
  }

  @Get("myLedgerCategory/:adminid/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  myLedgerCategory(
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.myLedgerCategory(adminid, companyid);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [LedgerCategoryDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }
  @Get(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: LedgerCategoryDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<LedgerCategoryDto> {
    return this.service.getOne(id);
  }
  //create
  @Post()
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateLedgerCategoryDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.create(createDto);
  }
  //update
  @Put(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: cartEntity })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateLedgerCategoryDto
  ): Promise<CommonResponseDto> {
    return this.service.update(id, updateDto);
  }

  @Get("/getLedgerCategoryById/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  getLedgerById(@Param("id") id: any): Promise<CommonResponseDto> {
    return this.service.findOne(id);
  }
  //delete
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: LedgerCategoryDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<LedgerCategoryDto> {
    return this.service.delete(id);
  }
}
