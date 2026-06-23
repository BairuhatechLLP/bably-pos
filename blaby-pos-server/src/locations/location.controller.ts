import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateLocationDto } from "./dto/location.create";
import { LocationService } from "./location.services";
import { LocationMaster } from "./location.entity";
import { LocationDto } from "./dto/location.dto";
import { UpdateLocationDto } from "./dto/location.update";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { PageOptionsDto } from "../shared/dto";
import { LocationListAllQueryDto } from "./dto/locationQuery.dto";
@Controller("location")
@ApiTags("Location")
@UseInterceptors(ErrorsInterceptor)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get()
  @ApiOkResponse({ type: [LocationMaster] })
  findAll(): Promise<any> {
    return this.locationService.findAll();
  }

  @Get("byId/:id")
  @ApiOkResponse({ type: [LocationDto] })
  @ApiParam({ name: "id" })
  findOne(@Param("id", new ParseIntPipe()) id: Number): Promise<any> {
    return this.locationService.findOne(id);
  }
  @Get("/user/:id")
  @ApiOkResponse({ type: [LocationMaster] })
  @ApiParam({ name: "id", required: true })
  findAllUser(@Param("id") id: string): Promise<any> {
    return this.locationService.findAllUser(id);
  }

  @Get("/list/:adminid/:companyid")
  @ApiOkResponse({ type: [LocationMaster] })
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  findListByCompany(
    // @UserId() userId: number,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.locationService.findListByCompany(adminid, companyid);
  }

  //find all data for a specific company with pagination
  @Get("/list-by-company/:companyid")
  @ApiOkResponse({ type: [LocationMaster] })
  @ApiBearerAuth()
  @ApiParam({ name: "companyid", required: true })
  findallByCompany(
    @UserId() userId: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() search: LocationListAllQueryDto,
  ): Promise<any> {
    return this.locationService.findallByCompany(
      userId,
      companyid,
      search,
      pageOptionsDto
    );
  }

  @Post("/add")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createLocationList: CreateLocationDto
  ): Promise<CommonResponseDto> {
    return this.locationService.create(createLocationList);
  }
  @Put("/update/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateLocationDto: UpdateLocationDto
  ): Promise<CommonResponseDto> {
    return this.locationService.update(updateLocationDto, id);
  }

  @Get("/delete/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  softDelete(@Param("id", new ParseIntPipe()) id: number): Promise<CommonResponseDto> {
    return this.locationService.softDelete(id);
  }

  @Delete("/hardDelete/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  delete(@Param("id", new ParseIntPipe()) id: number): Promise<Object> {
    return this.locationService.delete(id);
  }
}
