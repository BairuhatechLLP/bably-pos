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

import { CountriesService } from "./countries_service";
import { Countries as cartEntity } from "./countries_model";
import { CountriesDto } from "./dto/countries_dto";
import { UpdateCountriesDto } from "./dto/countries_update_dto";
import { CreateCountriesDto } from "./dto/countries_create_dto";
import { PageOptionsDto } from "./../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("countries")
@ApiTags("Countries")
@UseInterceptors(ErrorsInterceptor)
export class CountriesController {
  constructor(private readonly service: CountriesService) {}
  @Get("all")
  @ApiOkResponse({ type: CommonResponseDto })
  findAllAirline(): Promise<CommonResponseDto> {
    return this.service.findAll();
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CountriesDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CountriesDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CountriesDto> {
    return this.service.getOne(id);
  }
  //create
  @Post()
  @ApiCreatedResponse({ type: cartEntity })
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateCountriesDto,
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
    @Body() updateDto: UpdateCountriesDto
  ): Promise<CountriesDto> {
    return this.service.update(id, updateDto);
  }
  //delete
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CountriesDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CountriesDto> {
    return this.service.delete(id);
  }
}
