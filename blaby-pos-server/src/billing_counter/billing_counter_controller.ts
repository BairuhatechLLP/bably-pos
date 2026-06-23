import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateCounterInterceptor } from "../shared/interceptor/createCounter.interceptor";
import { BillingCounter } from "./billing_counter_entity";
import { BillingCounterService } from "./billing_counter_service";
import { ListBillingCounterDto } from "./dto/billing_counter.list-dto";
import { CreateBillCounterDto } from "./dto/billing_counter_create.dto";
import { BillingCounterDto } from "./dto/billing_counter_dto";
import { Public } from "../shared/decorators/public.decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("billing_counter")
@ApiTags("billing_counter")
@UseInterceptors(ErrorsInterceptor)
export class BillingCounterController {
  constructor(private readonly service: BillingCounterService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [BillingCounterDto] })
  findAll(): Promise<BillingCounterDto[]> {
    return this.service.findAll();
  }

  @Get("/lists/:companyid")
  @ApiCreatedResponse({ type: BillingCounter })
  @ApiBearerAuth()
  findListByCompanyId(
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.service.findListByCompanyId(companyid);
  }

  @UseInterceptors(CreateCounterInterceptor)
  @Post("add")
  @ApiCreatedResponse({ type: BillingCounter })
  @ApiBearerAuth()
  create(@Body() createDto: CreateBillCounterDto): Promise<any> {
    return this.service.create(createDto);
  }
  
  @Post("addCounter")
  @Public()
  @ApiCreatedResponse({ type: BillingCounter })
  createCounter(@Body() createDto: CreateBillCounterDto): Promise<any> {
    return this.service.create(createDto);
  }

  @Post("/list")
  @ApiOkResponse({ type: [BillingCounterDto] })
  @ApiBearerAuth()
  list(@Body() create: ListBillingCounterDto): Promise<any> {
    return this.service.list(create);
  }

  @Get("counter/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: [BillingCounterDto] })
  getOne(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.service.getOne(id);
  }

  @Put("update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: BillingCounter })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: any
  ): Promise<any> {
    return this.service.update(id, updateDto);
  }
}
