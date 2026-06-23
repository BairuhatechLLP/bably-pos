import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseInterceptors } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { OtherMasterService } from "./other_master.service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { OtherMasterDto } from "./dto/other_master.dto";
import { CreateOtherMasterDto } from "./dto/other_master.create.dto";
import { UpdateOtherMasterDto } from "./dto/other_master.update.dto";

@Controller("otherMaster")
@ApiTags("otherMaster")
@UseInterceptors(ErrorsInterceptor)
export class OtherMasterController {
  constructor(private readonly otherMasterService: OtherMasterService) {}

  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(): Promise<CommonResponseDto> {
    return this.otherMasterService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: OtherMasterDto })
  @ApiParam({ name: 'id', required: true })
  findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.otherMasterService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: OtherMasterDto })
  create(
    @Body() createDto: CreateOtherMasterDto,
  ): Promise<CommonResponseDto> {
    return this.otherMasterService.create(createDto);
  }

  @Put(':id')
  @ApiOkResponse({ type: OtherMasterDto })
  @ApiParam({ name: 'id', required: true })
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request,
    @Body() updateDto: UpdateOtherMasterDto,
  ): Promise<CommonResponseDto> {
    return this.otherMasterService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OtherMasterDto })
  @ApiParam({ name: 'id', required: true })
  delete(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request,
  ): Promise<OtherMasterDto> {
    return this.otherMasterService.delete(id);
  }


}
