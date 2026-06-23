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
} from "@nestjs/swagger";

import { LedgerCategoryGroupService } from "./ledger_category_group_service";
import { LedgerCategoryGroup as cartEntity } from "./ledger_category_group_model";
import { LedgerCategoryGroupDto } from "./dto/ledger_category_group_dto";
import { UpdateLedgerCategoryGroupDto } from "./dto/ledger_category_group_update_dto";
import { CreateLedgerCategoryGroupDto } from "./dto/ledger_category_group_create_dto";
import { PageOptionsDto } from "./../shared/dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("ledgercategorygroup")
@ApiTags("Ledgercategorygroup")
@UseInterceptors(ErrorsInterceptor)
export class LedgerCategoryGroupController {
  constructor(private readonly service: LedgerCategoryGroupService) {}
  @Get("all")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [LedgerCategoryGroupDto] })
  findAllAirline(): Promise<LedgerCategoryGroupDto[]> {
    return this.service.findAll();
  }
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [LedgerCategoryGroupDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }
  @Get(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: LedgerCategoryGroupDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<LedgerCategoryGroupDto> {
    return this.service.getOne(id);
  }
  //create
  @Post()
  @ApiCreatedResponse({ type: cartEntity })
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateLedgerCategoryGroupDto,
    @Req() request
  ): Promise<cartEntity> {
    return this.service.create(createDto);
  }
  //update
  @Put(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: cartEntity })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateLedgerCategoryGroupDto
  ): Promise<LedgerCategoryGroupDto> {
    return this.service.update(id, updateDto);
  }
  //delete
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: LedgerCategoryGroupDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<LedgerCategoryGroupDto> {
    return this.service.delete(id);
  }
}
