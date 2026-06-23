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

import { JournalService } from "./journal_service";
import { Journal as cartEntity } from "./journal_model";
import { JournalDto } from "./dto/journal_dto";
import { PageOptionsDto } from "./../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("Journal")
@ApiTags("Journals")
@UseInterceptors(ErrorsInterceptor)
export class JournalController {
  constructor(private readonly service: JournalService) {}
  @Get("/list/:id/:createdBy/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "createdBy", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: [CommonResponseDto] })
  findAllAirline(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("createdBy", new ParseIntPipe()) createdBy: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.findAll(id, createdBy, companyid);
  }
  
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [JournalDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }
  @Get("/getJournalById/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.getOne(id);
  }
  //create
  @Post("/add")
  @ApiCreatedResponse({ type: cartEntity })
  @ApiBearerAuth()
  create(@Body() createDto: any, @Req() request): Promise<CommonResponseDto> {
    return this.service.create(createDto);
  }
  //update
  @Put("/update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: any
  ): Promise<CommonResponseDto> {
    return this.service.update(id, updateDto);
  }
 
  @Delete("/delete/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: JournalDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<any> {
    return this.service.delete(id);
  }
}
