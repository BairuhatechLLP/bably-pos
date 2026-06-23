import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CounterDetails } from "./counter_details_entity";
import { CounterDetailsService } from "./counter_details_service";
import { ListCounterDetailsDto } from "./dto/counter_details.list-dto";
import { CounterDetailsDto } from "./dto/counter_details_dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { Data } from "./dto/query.dto";
@Controller("counter_details")
@ApiTags("counter_details")
@UseInterceptors(ErrorsInterceptor)
export class CounterDetailsController {
  constructor(private readonly service: CounterDetailsService) { }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CounterDetailsDto] })
  findAll(): Promise<CounterDetailsDto[]> {
    return this.service.findAll();
  }

  @Get("list/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CounterDetailsDto] })
  findAllByAdminId(
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.service.findAllByAdminId(companyid);
  }

  @Post("add/openshift")
  @ApiCreatedResponse({ type: CounterDetails })
  @ApiBearerAuth()
  openshift(@Body() createDto: any): Promise<any> {
    return this.service.openshift(createDto);
  }

  @Post("/list")
  @ApiOkResponse({ type: [CounterDetailsDto] })
  @ApiBearerAuth()
  list(@Body() create: ListCounterDetailsDto): Promise<any> {
    return this.service.list(create);
  }

  @Post("add/closeshift")
  @ApiCreatedResponse({ type: CounterDetails })
  @ApiBearerAuth()
  closeshift(@Body() createDto: any): Promise<any> {
    return this.service.closeshift(createDto);
  }

  @Post("counter/details")
  @ApiOkResponse({ type: [CounterDetailsDto] })
  @ApiBearerAuth()
  getCounterAssignAdmin(@Body() create: any): Promise<any> {
    return this.service.getCounterAssignAdmin(create);
  }

  @Post("counter/open")
  @ApiOkResponse({ type: [CounterDetailsDto] })
  @ApiBearerAuth()
  counterOpen(@Body() create: any): Promise<any> {
    return this.service.counterOpen(create);
  }

  @Post("/list-by-shift")
  @ApiOkResponse({ type: [CounterDetailsDto] })
  @ApiBearerAuth()
  listByShift(
    @UserId() userId: number,
    @Body() create: any): Promise<any> {
    return this.service.listByShift(userId, create);
  }

  @Get("clock-in-counter")
  @ApiOkResponse({type:[CounterDetailsDto]})
  @ApiBearerAuth()
  clockInCounter(
    @UserId() userId:number,
    @Query() data: Data,
  ): Promise<any> {
    return this.service.clockInCounter(userId,data)
  }

  // @Post("/list-by-date")
  // @ApiOkResponse({ type: [CounterDetailsDto] })
  // @ApiBearerAuth()
  // listByDate(
  //   @UserId() userId: number,
  //   @Body() create: any): Promise<any> {
  //   return this.service.listByDate(userId, create);
  // }
}
